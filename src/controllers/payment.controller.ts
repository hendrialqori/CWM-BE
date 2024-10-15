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
            return res
                .status(201)
                .json({ data: { status }, message })


        } catch (error) {
            next(error)
        }
    }

    static async emailSender(req: Request, res: Response, next: NextFunction) {
        try {
            const messageId = await PaymentService.emailSender()
            return res.status(200).json({ messageId })

        } catch (error) {
            next(error)
        }
    }
}