import { type CreateInvoiceRequest } from "xendit-node/invoice/models";
import { type Request } from "express";
import { XENDIT_CLIENT } from "../configs/xendit-client";
import ProductService from "./products.service";
import { InsertTransaction } from "../types";
import { Validation } from "../validation/validation";
import { TransactionsValidation } from "../validation/transactions.validation";

import { db } from "../model/db";
import { transactions as transactionsTable } from "../model/schema"

export default class PaymentService {

    static async createInvoice(request: Request) {
        const invoiceClient = XENDIT_CLIENT.Invoice

        // get id from body request;
        const body = request.body
        // validation
        const transactionRequest = Validation.validate(TransactionsValidation.ADD, body)

        const { productId, name, phone, email } = transactionRequest

        // get product by id
        const product = await ProductService.get(productId)
        // invoice object
        const invoice: CreateInvoiceRequest = {
            externalId: `transaction-${Date.now()}`,
            currency: "IDR",
            amount: product.originalPrice,
            customer: {
                email,
                mobileNumber: String(phone),
                givenNames: name,
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
        }
        // response invoice
        const { id: invoiceId, invoiceUrl } =
            await invoiceClient.createInvoice({ data: invoice })

        //create transaction history
        const newTransaction: InsertTransaction = {
            name, phone, email, productId, invoiceId, invoiceUrl
        }
        await db.insert(transactionsTable).values(newTransaction)

        return { invoiceUrl }
    }

}