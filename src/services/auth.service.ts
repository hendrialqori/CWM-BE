import { type Request, type Response } from "express";
import bycript from "bcrypt"
import jwt from "jsonwebtoken"
import { eq } from "drizzle-orm";
import { db } from "../model/db";
import { users as usersTable } from "../model/schema";
import { Validation } from "../validation/validation";
import { AuthValidation } from "../validation/auth.validation";
import { ResponseError } from "../utils/errors";
import { type InsertUser } from "../types";
import UserService from "./users.service";
import { AUTH_COOKIE } from "../constant";

export default class AuthService {

    static async login(request: Omit<InsertUser, 'username'>, response: Response) {

        // administratorMeggie
        const loginRequest = Validation.validate(AuthValidation.LOGIN, request)

        const [user] = await AuthService.emailChecker(loginRequest.email)
        if (!user) {
            throw new ResponseError(404, 'Email not found!')
        }

        // password match checker
        const isPasswordValid = await bycript.compare(loginRequest.password, user.password)
        if (!isPasswordValid) {
            throw new ResponseError(400, "Wrong password!")
        }

        // generate jwt token
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt
        }
        const expiresIn = 60 * 60 * 24 * 7 // 7 days

        const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn
            // expiresIn: //1 minute
        })

        return { ...payload, access_token: token }
    }

    static async register(request: InsertUser) {

        const registerRequest = Validation.validate(AuthValidation.REGISTER, request)

        const checkEmail = await AuthService.emailChecker(registerRequest.email)
        const checkUsername = await AuthService.usernameChecker(registerRequest.username)

        if (checkUsername.length) {
            throw new ResponseError(400, "Username already exists!")
        }
        if (checkEmail.length) {
            throw new ResponseError(400, "Email already exists!")
        }

        // Number of salt rounds (the higher, the more secure but slower the hash generation) 
        const saltRounds = 10
        // hashing password
        const hashingPassword = await bycript.hash(registerRequest.password, saltRounds)
        // store data for new user
        const newUser = {
            username: registerRequest.username,
            email: registerRequest.email,
            password: hashingPassword
        }

        const insertNewUser =
            await db
                .insert(usersTable)
                .values(newUser)
                .$returningId()

        return { ...insertNewUser[0], ...registerRequest }
    }

    static async profile(request: Request) {
        const auth_cookie = request.cookies[AUTH_COOKIE] ?? ""

        const selector = {
            username: usersTable.username,
            email: usersTable.email,
            createdAt: usersTable.createdAt
        }

        const profile = await db.select(selector)
            .from(usersTable).where(eq(usersTable.sessionToken, auth_cookie))

        return profile[0]
    }


    // deprecated
    static async logout(request: Request, response: Response) {

        const session_name = process.env.SESSION_NAME
        const session = request.cookies[session_name!]

        const sessionChecker = await AuthService.sessionTokenChecker(session)
        const users = sessionChecker

        if (!users || !users.length) {
            throw new ResponseError(404, "User not found")
        }

        const currentUSer = users[0]
        currentUSer.sessionToken = null

        await UserService.update(currentUSer.id, currentUSer)

        response.clearCookie(session_name!, {
            httpOnly: true,
            secure: false,
            path: "/",
        })

    }

    private static async emailChecker(email: string) {
        return await db.select().from(usersTable).where(eq(usersTable.email, email))
    }

    private static async usernameChecker(username: string) {
        return await db.select().from(usersTable).where(eq(usersTable.username, username))
    }

    static async sessionTokenChecker(sessionToken: string) {
        return await db.select().from(usersTable).where(eq(usersTable.sessionToken, sessionToken))
    }
}