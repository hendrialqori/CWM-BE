import { z, ZodType } from "zod"
import { MAX_IMAGE_SIZE, ALLOWS_MIME_TYPE } from "../constant"
import radash from "radash";

const onlyDigits = /[^0-9DMY/]/g

export class ProductsValidation {
    static readonly ADD: ZodType = z.object({
        title: z.string().max(100, { message: "Max 100 characters" }).nullish(),
        
        // image field direct handle through multer middleware
        // image: z.any()
        //     .refine((file: File) => radash.isObject(file), "Image required")
        //     .refine((file: Express.Multer.File) => file.size < MAX_IMAGE_SIZE, "Max size is 3Mb")
        //     .refine((file: Express.Multer.File) =>
        //         !ALLOWS_MIME_TYPE.includes(file?.mimetype as typeof ALLOWS_MIME_TYPE[number]), "Only png, jpg and jpeg formats allowed")
        //     .transform((file: Express.Multer.File) => {
        //         // console.log(file.filename)
        //         return file?.filename
        //     }),
        originalPrice: z.string()
            .min(1)
            .refine((price) => !onlyDigits.test(price), "Invalid input, Please enter a valid number")
            .transform((price) => Number(price)),
        strikeoutPrice: z.string()
            .min(1)
            .refine((price) => !onlyDigits.test(price), "Invalid input, Please enter a valid number")
            .transform((price) => Number(price)),
        description: z.string().min(1)
    })

}