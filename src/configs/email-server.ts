import nodemailer from "nodemailer"
//@ts-ignore
import hbs from "nodemailer-express-handlebars"
import path from "path"

export const EMAIL_SERVER = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // TLS = Transport Layer Security
    secure: false,
    service: "gmail",
    auth: {
        user: "teamhendri18@gmail.com",
        pass: "lzfd tvtj vwkm lkhb"
    }
})

// // use handlebars to nodemailer
// EMAIL_SERVER.use("compile", hbs({
//     viewEngine: { defaultLayout: "", extname: ".hbs" },
//     viewPath: path.resolve("./views/"),
//     extName: ".hbs"
// }))
