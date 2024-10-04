import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { AuthenticationError } from "../utils/errors";

export async function accessValidation(req: Request, res: Response, next: NextFunction) {
    try {
        // header
        const authorization = req.headers.authorization
        // token
        const token = authorization.split(" ")[1]
        // secret key
        const secret = process.env.SECRET
        // verify token
        jwt.verify(token, secret)

        next()

    } catch (error) {
        next(new AuthenticationError(401, "Unauthorized"))
    }
}