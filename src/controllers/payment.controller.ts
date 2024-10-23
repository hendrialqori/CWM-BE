import { NextFunction, Request, Response } from "express";
import PaymentService from "../services/payment.service";
import { StatusCodes } from "http-status-codes";

export default class PaymentController {
    static async createInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const invoice = await PaymentService.createInvoice(req)
            const { invoiceUrl } = invoice

            return res
                .status(StatusCodes.OK)
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
                .status(StatusCodes.OK)
                .send({ data: { status }, message })

        } catch (error) {
            next(error)
        }
    }

    static async emailSender(_req: Request, res: Response, next: NextFunction) {
        try {
            const messageId = await PaymentService.emailSender({
                buyer: "Prabowo",
                product: "Chinesewithmeggie",
                email: "teamhendri18@gmail.com",
                image: "1728909692374-Icon-3-removebg-preview.png",
                link: ""
            })
            return res
                .status(StatusCodes.OK)
                .send({ messageId })

        } catch (error) {
            next(error)
        }
    }

    static async downloadZip(req: Request, res: Response, next: NextFunction) {
        try {
            await PaymentService.downloadZip(req, res)
        } catch (error) {
            next(error)
        }
    }
}