import type { Request } from "express";
import { eq } from "drizzle-orm";
import { db } from "../model/db";
import {
    transactions as transactionsTable,
    products as productsTable
} from "../model/schema";
import { type InsertTransaction } from "../types";
import { Validation } from "../validation/validation";
import { TransactionsValidation } from "../validation/transactions.validation";
import radash from "radash"
import { ResponseError } from "../utils/response-error";

export class TransactionService {
    private static COLUMN = {
        id: transactionsTable.id,
        email: transactionsTable.email,
        phone: transactionsTable.phone,
        product: {
            id: productsTable.id,
            title: productsTable.title,
            image: productsTable.image,
            originalPrice: productsTable.originalPrice,
            strikeoutPrice: productsTable.strikeoutPrice,
            description: productsTable.description
        },
        createdAt: transactionsTable.createdAt,
        updatedAt: transactionsTable.updatedAt
    }

    static async list() {
        const transactions =
            await db.select(TransactionService.COLUMN)
                .from(transactionsTable)
                .innerJoin(productsTable,
                    eq(transactionsTable.productId, productsTable.id))

        return transactions
    }

    static async get(id: number) {
        const transactions =
            await db.select(TransactionService.COLUMN)
                .from(transactionsTable)
                .innerJoin(productsTable,
                    eq(transactionsTable.productId, productsTable.id))
                .where(eq(transactionsTable.id, id))

        const transaction = transactions[0]

        if (!radash.isObject(transaction)) {
            throw new ResponseError(404, `Transaction not found with id ${id}`)
        }

        return transaction
    }

    static async add(request: Request) {
        const body = request.body as InsertTransaction
        const transactionRequest = Validation.validate(TransactionsValidation.ADD, body)

        const newtransaction =
            await db.insert(transactionsTable).values(transactionRequest).$returningId()

        return { ...newtransaction[0], ...transactionRequest }
    }

    static update(id: number, request: Request) { }

    static async remove(id: number) {
        // check is there transaction with id
        await TransactionService.get(id)
        // and then, remove from db
        await db.delete(transactionsTable)
            .where(eq(transactionsTable.id, id))
    }
}