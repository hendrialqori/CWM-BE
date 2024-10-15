//.env
export const SECRET_KEY = process.env.SECRET_KEY
export const DATABASE_URL = process.env.DATABASE_URL
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN
export const SUCCESS_PAYMENT_URL = process.env.SUCCESS_PAYMENT_URL
export const FAILED_PAYMENT_URL = process.env.FAILED_PAYMENT_URL
export const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY
export const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN
export const EMAIL_SERVER_HOST = process.env.EMAIL_SERVER_HOST
export const EMAIL_SERVER_PORT = process.env.EMAIL_SERVER_PORT
export const EMAIL_SERVER_SERVICE = process.env.EMAIL_SERVER_SERVICE
export const EMAIL_SERVER_USER = process.env.EMAIL_SERVER_USER
export const EMAIL_SERVER_PASSWORD = process.env.EMAIL_SERVER_PASSWOR

export const MAX_IMAGE_SIZE = 3000000 //3mb
export const ALLOWS_MIME_TYPE = ["image/png", "image/jpg", "image/jpeg"] as const
export const STATUS = ["PENDING", "SETTLED", "FAILED"] as const