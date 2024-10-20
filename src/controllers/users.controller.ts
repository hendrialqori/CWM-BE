import type { NextFunction, Request, Response } from 'express'
import UserService from '../services/users.service'
import { StatusCodes } from 'http-status-codes'

export default class UsersController {

    static async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserService.list()

            return res
                .status(StatusCodes.OK)
                .send({ data: users, message: "Successfully" })

        } catch (error) {
            next(error)
        }

    }
    static async get(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as { id: number }
            const user = await UserService.get(params.id)

            return res
                .status(StatusCodes.OK)
                .send({ data: user, message: "Successfully" })

        } catch (error) {
            next(error)
        }

    }

    static async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as { id: number }
            await UserService.remove(params.id)

            return res
                .status(StatusCodes.NO_CONTENT)
                .json({ message: `Successfully remove user with id ${params.id}` })

        } catch (error) {
            next(error)
        }
    }
}