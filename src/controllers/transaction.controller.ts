import type { Request, Response, NextFunction } from "express"
import { TransactionService } from "../services/transactions.service"

export class TransactionsController {
    static async list(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await TransactionService.list(req)
            return res
                .status(200)
                .json({
                    data: result.transactions,
                    meta: result.meta,
                    message: "Successfully"
                })

        } catch (error) {
            next(error)
        }
    }

    static async get(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as { id: number }
            const transaction = await TransactionService.get(params.id)
            return res.status(200).json({ data: transaction, message: "Successfully" })
        } catch (error) {
            next(error)
        }
    }

    static async add(req: Request, res: Response, next: NextFunction) {
        try {
            const newtransaction = await TransactionService.add(req)
            return res.status(200).json({
                data: newtransaction,
                message: "Successfully added new transaction"
            })
        } catch (error) {
            next(error)
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as { id: number }

            await TransactionService.updateStatus(params.id, req)
            return res.status(200)
                .json({ data: null, message: `Successfully update status product with id ${params.id}` })

        } catch (error) {
            next(error)
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as { id: number }
            await TransactionService.remove(params.id)
            return res.status(200)
                .json({ data: null, message: `Successfully remove user with id ${params.id}` })
        } catch (error) {
            next(error)
        }
    }
}