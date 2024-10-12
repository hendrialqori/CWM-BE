import { NextFunction, Request, Response } from "express";
import PaymentService from "../services/payment.service";

export default class PaymentController {
    static async createInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const invoice = await PaymentService.createInvoice(req)
            const { invoiceUrl } = invoice

            return res
                .status(200)
                .json({
                    data: { invoiceUrl },
                    message: "Successfully create invoice"
                })

        } catch (error) {
            next(error)
        }
    }

    static async webhook(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, message } = await PaymentService.webhook(req)

            const X_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN
            return res
                .setHeader("x-callback-token", X_CALLBACK_TOKEN)
                .status(201)
                .json({ data: { status }, message })


        } catch (error) {
            next(error)
        }
    }
}