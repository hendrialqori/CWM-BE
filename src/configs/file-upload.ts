import multer from "multer";
import { FileUploadError } from "../utils/errors";
import { MAX_IMAGE_SIZE } from "../constant";

const storage = multer.memoryStorage()

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowsMimeType = ["image/png", "image/jpg", "image/jpeg"]
    if (allowsMimeType.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
        cb(new FileUploadError(415, "Only png, jpg and jpeg formats allowed!"))
    }
}

const fileLimits: multer.Options = {
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    }
}

export const fileUpload = multer({
    storage,
    fileFilter,
    limits: fileLimits.limits
})
