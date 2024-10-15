import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { AuthenticationError } from "../utils/errors";
import { SECRET_KEY } from "../constant";

export async function accessValidation(req: Request, res: Response, next: NextFunction) {
    try {
        // header
        const authorization = req.headers.authorization
        // token
        const token = authorization.split(" ")[1]
        // verify token
        const payload = jwt.verify(token, SECRET_KEY)
        //@ts-ignore
        req.payload = payload

        next()

    } catch (error) {
        next(new AuthenticationError(401, "Unauthorized"))
    }
}