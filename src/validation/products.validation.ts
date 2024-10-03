import { z, ZodType } from "zod"
import { MAX_IMAGE_SIZE, ALLOWS_MIME_TYPE } from "../constant"
import radash from "radash";

const onlyDigits = /[^0-9DMY/]/g

export class ProductsValidation {
    static readonly ADD: ZodType = z.object({
        title: z.string().max(100, { message: "Max 100 characters" }).nullish(),
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