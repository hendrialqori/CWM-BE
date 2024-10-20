import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes"
import { InsertUser } from "../types";
import AuthService from "../services/auth.service";

export default class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request = req.body as InsertUser
            const response = await AuthService.register(request)

            return res
                .status(StatusCodes.CREATED)
                .send({ data: response, message: "Successfully add new user:)" })

        } catch (error) {
            next(error)
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request = req.body as Omit<InsertUser, 'username'>
            const data = await AuthService.login(request, res)

            return res
                .status(StatusCodes.OK)
                .send({ data, message: "Login successfully!" })

        } catch (error) {
            next(error)
        }
    }
}