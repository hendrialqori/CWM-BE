import type { CreateInvoiceRequest, Invoice, InvoiceStatus } from "xendit-node/invoice/models";
import { Request, Response } from "express";
import { XENDIT_CLIENT } from "../configs/xendit-client";
import ProductService from "./products.service";
import { InsertTransaction } from "../types";
import { Validation } from "../validation/validation";
import { TransactionsValidation } from "../validation/transactions.validation";

import { db } from "../model/db";
import { transactions as transactionsTable } from "../model/schema"
import { eq } from "drizzle-orm";
import { STATUS } from "../constant";
import { PaymentError, ResponseError } from "../utils/errors";

export default class PaymentService {

    private static invoiceClient = XENDIT_CLIENT.Invoice

    static async getTransactionByExternalId(externalId: string) {
        const transactions =
            await db.select()
                .from(transactionsTable)
                .where(eq(transactionsTable.externalId, externalId))

        const [transaction] = transactions
        if (!transaction) {
            throw new ResponseError(404, `Transaction not found with externalId ${externalId}`)
        }
        return transaction
    }

    static async createTransaction(payload: InsertTransaction) {
        // validation
        const transactionValidation = Validation.validate(TransactionsValidation.ADD, payload)
        // check is there product with id = validation.productId
        const product = await ProductService.get(transactionValidation.productId)
        // create transaction record
        const [transaction] = await db.insert(transactionsTable).values(transactionValidation).$returningId()

        return {
            transaction: { id: transaction.id, ...transactionValidation },
            product
        }
    }

    static async updateTransaction(payload: Pick<InsertTransaction, "externalId" | "invoiceId" | "invoiceUrl"> & { id: number }) {
        await db.update(transactionsTable)
            .set(payload as unknown as InsertTransaction)
            .where(eq(transactionsTable.id, payload.id))
    }

    static async updateStatusTransaction(payload: { externalId: string; status: typeof STATUS[number] }) {
        const data = { status: payload.status } as unknown as InsertTransaction

        await PaymentService.getTransactionByExternalId(payload.externalId)

        await db.update(transactionsTable)
            .set(data)
            .where(eq(transactionsTable.externalId, payload.externalId))
    }

    static async createInvoice(request: Request) {
        const body = request.body

        const res = await PaymentService.createTransaction(body)
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
                    name: product.title,
                    price: product.originalPrice,
                    quantity: 1,
                    category: "Ebook"
                }
            ],
            customerNotificationPreference: {
                invoiceCreated: ["whatsapp", "email"],
                invoicePaid: ["whatsapp", "email"],
                invoiceReminder: ["whatsapp", "email"]
            },
            successRedirectUrl: process.env.SUCCESS_PAYMENT_URL,
            failureRedirectUrl: process.env.FAILED_PAYMENT_URL
        }

        // create invoice xendit payment
        const invoice = await this.invoiceClient.createInvoice({ data: invoiceData })

        // update transaction with invoice id & url
        await PaymentService.updateTransaction({
            id: transaction.id,
            externalId: invoice.externalId,
            invoiceId: invoice.id,
            invoiceUrl: invoice.invoiceUrl
        })

        return { invoiceUrl: invoice.invoiceUrl }
    }

    static async webhook(request: Request) {
        const { id } = request.body as { id: string }

        // get invoice by id
        let invoice: Invoice
        try {
            invoice = await this.invoiceClient.getInvoiceById({ invoiceId: id })
        } catch (error) {
            throw new PaymentError(404, `Invoice not found with id ${id}`)
        }

        //x-callback-token
        const X_CALLBACK_TOKEN_CLIENT = request.headers["x-callback-token"]
        const X_CALLBACK_TOKEN_SERVER = process.env.XENDIT_CALLBACK_TOKEN

        // token header required
        if (!X_CALLBACK_TOKEN_CLIENT) {
            throw new PaymentError(400, "Token needed")
        }

        // verify x-callback-token between client and server
        if (X_CALLBACK_TOKEN_SERVER !== X_CALLBACK_TOKEN_CLIENT) {
            throw new PaymentError(400, "Token invalid")
        }

        type WebhookResponse = { status: InvoiceStatus, message: string }
        type MappingStatus = Record<InvoiceStatus, () => Promise<WebhookResponse> | WebhookResponse>

        const mappingStatus: MappingStatus = {
            SETTLED: async () => {
                await PaymentService.updateStatusTransaction({
                    externalId: invoice.externalId, status: "SETTLED"
                })
                return { status: "SETTLED", message: "Payment already processed" }
            },
            PAID: async () => {
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
                return { status: "EXPIRED", message: "payment has expired" }
            },
            UNKNOWN_ENUM_VALUE: () => ({ status: "UNKNOWN_ENUM_VALUE", message: "unknown status value" })
        }

        return mappingStatus[invoice.status]()
    }

}