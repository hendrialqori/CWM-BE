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
}