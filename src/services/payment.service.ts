import type { CreateInvoiceRequest, Invoice, InvoiceStatus } from "xendit-node/invoice/models";
import { Request } from "express";
import { eq } from "drizzle-orm";
import ejs from "ejs"

import { XENDIT_CLIENT } from "../configs/xendit-client";
import ProductService from "./products.service";
import { InsertTransaction } from "../types";
import { Validation } from "../validation/validation";
import { TransactionsValidation } from "../validation/transactions.validation";

import { db } from "../model/db";
import { transactions as transactionsTable } from "../model/schema"
import { products as productsTable } from "../model/schema";
import { EmailSenderError, PaymentError, ResponseError } from "../utils/errors";
import {
    FAILED_PAYMENT_URL, STATUS, SUCCESS_PAYMENT_URL, XENDIT_CALLBACK_TOKEN,
    EMAIL_SENDER_FROM, EMAIL_SENDER_SUBJECT, SERVER_ORIGIN
} from "../constant";
import { EMAIL_SERVER } from "../configs/email-server";
import { StatusCodes } from "http-status-codes";
import path from "path";


export default class PaymentService {
    private static invoiceClient = XENDIT_CLIENT.Invoice

    private static async getProduct(id: number) {
        const [product] = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, id))


        if (!product) {
            throw new ResponseError(StatusCodes.NOT_FOUND, `Product not found with id ${id}`)
        }
        return product
    }

    private static async getTrx(externalId: string) {
        const transactions =
            await db.select()
                .from(transactionsTable)
                .where(eq(transactionsTable.externalId, externalId))

        const [transaction] = transactions
        if (!transaction) {
            throw new ResponseError(404,
                `Transaction not found with externalId ${externalId}`)
        }
        return transaction
    }

    static async createTrx(payload: InsertTransaction) {
        // validation
        const transactionValidation =
            Validation.validate(TransactionsValidation.ADD, payload)
        // check is there product with id = validation.productId
        const product =
            await ProductService.get(transactionValidation.productId)
        // create transaction record
        const [transaction] = await db
            .insert(transactionsTable)
            .values(transactionValidation)
            .$returningId()

        return {
            transaction: { id: transaction.id, ...transactionValidation },
            product
        }
    }

    static async updateTrx(payload: Partial<InsertTransaction> & { id: number }) {
        await db
            .update(transactionsTable)
            .set(payload)
            .where(eq(transactionsTable.id, payload.id))
    }

    static async updateStatusTransaction(payload:
        { externalId: string; status: typeof STATUS[number] }
    ) {
        const data = { status: payload.status } as unknown as InsertTransaction

        // first check, is there trx with externalId = payload.externalId
        await PaymentService.getTrx(payload.externalId)

        await db.update(transactionsTable)
            .set(data)
            .where(eq(transactionsTable.externalId, payload.externalId))
    }

    static async createInvoice(request: Request) {
        const body = request.body

        const res = await PaymentService.createTrx(body)
        const transaction = res.transaction;
        const product = res.product

        // invoice data
        const invoiceData: CreateInvoiceRequest = {
            externalId: `trx_${Date.now()}_${transaction.email}`,
            currency: "IDR",
            amount: product.originalPrice,
            customer: {
                email: transaction.email,
                mobileNumber: String(transaction.phone),
                givenNames: transaction.name,
            },
            description: `Invoice of ${product.title} payment`,
            items: [
                {
                    referenceId: String(product.id),
                    name: product.title ?? "",
                    price: product.originalPrice,
                    quantity: 1,
                    category: "Ebook",
                }
            ],
            customerNotificationPreference: {
                invoiceCreated: ["whatsapp", "email"],
                invoicePaid: ["whatsapp", "email"],
                invoiceReminder: ["whatsapp", "email"]
            },
            successRedirectUrl: SUCCESS_PAYMENT_URL,
            failureRedirectUrl: FAILED_PAYMENT_URL
        }

        // create invoice xendit payment
        const invoice = await this.invoiceClient.createInvoice({ data: invoiceData })

        // update transaction with invoice id & url
        await PaymentService.updateTrx({
            id: transaction.id,
            externalId: invoice.externalId,
            invoiceId: invoice.id,
            invoiceUrl: invoice.invoiceUrl
        })

        return { invoiceUrl: invoice.invoiceUrl }
    }

    static async emailSender(payload:
        { buyer: string; product: string, email: string, image: string, link: string }) {
        try {
            const file = path.join(__dirname, "..", "..", "views", "email.ejs")
            const html =
                await ejs.renderFile(file, {
                    name: payload.buyer, product: payload.product, image: payload.image, link: payload.link
                })

            const info = await EMAIL_SERVER.sendMail({
                from: EMAIL_SENDER_FROM,
                to: payload.email,
                subject: EMAIL_SENDER_SUBJECT,
                html
            })

            return info.messageId

        } catch (error) {
            const errorMessage = (error as Error).message
            throw new EmailSenderError(StatusCodes.BAD_GATEWAY, errorMessage)
        }
    }

    static async webhook(request: Request) {
        const { id } = request.body as { id: string }

        // get invoice by id
        let invoice: Invoice
        try {
            invoice = await this.invoiceClient.getInvoiceById({ invoiceId: id })
        } catch (error) {
            throw new PaymentError(StatusCodes.NOT_FOUND, `Invoice not found with id ${id}`)
        }

        const [item] = invoice.items
        const product = await PaymentService.getProduct(Number(item.referenceId))
        const transaction = await PaymentService.getTrx(invoice.externalId)
        const emailPayload = {
            buyer: transaction.name,
            image: `${SERVER_ORIGIN}/static/${product.image}`,
            product: product.title,
            email: transaction.email,
            link: product.link
        }

        //x-callback-token
        const X_CALLBACK_TOKEN_CLIENT = request.headers["x-callback-token"]
        const X_CALLBACK_TOKEN_SERVER = XENDIT_CALLBACK_TOKEN

        // token header required
        if (!X_CALLBACK_TOKEN_CLIENT) {
            throw new PaymentError(StatusCodes.UNAUTHORIZED, "Token needed")
        }

        // verify x-callback-token between client and server
        if (X_CALLBACK_TOKEN_SERVER !== X_CALLBACK_TOKEN_CLIENT) {
            throw new PaymentError(StatusCodes.BAD_REQUEST, "Token invalid")
        }

        type WebhookResponse = { status: InvoiceStatus, message: string }
        type IMappingStatus = Record<InvoiceStatus, () => Promise<WebhookResponse> | WebhookResponse>

        const mappingStatus: IMappingStatus = {
            SETTLED: async () => {
                // sending email to buyer
                await PaymentService.emailSender(emailPayload)
                // update transaction statu
                await PaymentService.updateStatusTransaction({
                    externalId: invoice.externalId, status: "SETTLED"
                })

                return { status: "SETTLED", message: "Payment already processed" }
            },
            PAID: async () => {
                // sending email to buyer
                await PaymentService.emailSender(emailPayload)
                // update transaction statu
                await PaymentService.updateStatusTransaction({
                    externalId: invoice.externalId, status: "SETTLED"
                })

                return { status: "PAID", message: "Payment success" }
            },
            PENDING: () => ({ status: "PENDING", message: "Payment on proccess [PENDING]" }),
            EXPIRED: async () => {
                await PaymentService.updateStatusTransaction({
                    externalId: invoice.externalId, status: "FAILED"
                })
                throw new PaymentError(StatusCodes.PAYMENT_REQUIRED, "Payment has expired")
            },
            UNKNOWN_ENUM_VALUE: () => {
                throw new PaymentError(StatusCodes.NOT_FOUND, "Unknown status value")
            }
        }

        return mappingStatus[invoice.status]()
    }

}