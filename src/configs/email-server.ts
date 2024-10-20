import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { EMAIL_SERVER_PASSWORD, EMAIL_SERVER_USER } from "../constant"
dotenv.config()

export const EMAIL_SERVER = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // TLS = Transport Layer Security
    secure: false,
    service: "gmail",
    auth: {
        user: EMAIL_SERVER_USER,
        pass: EMAIL_SERVER_PASSWORD
    }
})
