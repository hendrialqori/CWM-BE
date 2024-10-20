import type { Request, Response, NextFunction } from "express";
import { ZodError } from 'zod'
import multer from "multer";
import * as Error from "../utils/errors"
import { winstonLogger } from "../utils/helpers";
import { StatusCodes } from "http-status-codes";

export function errorResponse(error: Error, request: Request, response: Response, next: NextFunction) {

    if (error instanceof ZodError) {
        winstonLogger.error("Validation Error", {
            ip: request.ip
        })

        response.status(400).json({
            type: `Validation Error`,
            errors: error.flatten()
        })

    } else if (error instanceof Error.ResponseError) {
        winstonLogger.error("Response Error", {
            ip: request.ip
        })

        response.status(error.status).json({
            type: "Response Error",
            errors: error.message
        });

    } else if (error instanceof multer.MulterError || error instanceof Error.FileUploadError) {
        winstonLogger.error("File Upload Error", {
            message: error.stack
        })

        response.status(400).json({
            type: `File upload Error`,
            errors: error.message
        })

    } else if (error instanceof Error.AuthenticationError) {
        winstonLogger.error("Authentication Error", {
            message: error.stack
        })

        response.status(401).json({
            type: `Authentication Error`,
            errors: error.message
        })

    } else if (error instanceof Error.PaymentError) {
        winstonLogger.error("Authentication Error", {
            message: error.stack
        })

        response.status(error.status).json({
            type: `Payment Error`,
            errors: error.message
        })
    } else if (error instanceof Error.EmailSenderError) {
        winstonLogger.error("Email sender Error", {
            message: error.stack
        })

        response.status(error.status).json({
            type: `Email sender Error`,
            errors: error.message
        })
    } else {
        winstonLogger.error("Unknown Error", {
            message: error.stack
        })

        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            type: "Unknown Error",
            errors: error.message
        });
    }

}