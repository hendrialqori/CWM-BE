import z, { ZodType } from "zod"
import { STATUS } from "../constant"

export class TransactionsValidation {
    static readonly ADD: ZodType = z.object({
        name: z.string().min(1, { message: "Required" }).max(255, { message: "Max length of characters is 255" }),
        email: z.string().min(1, "Required").email("Not valid email"),
        phone: z.number().nonnegative("Non negative number"),
        productId: z.string().min(1, { message: "Required" }),
        invoiceId: z.string().min(1, { message: "Required" }).optional(),
        invoiceUrl: z.string().min(1, { message: "Required" }).optional()
    })

    static readonly UPDATE_STATUS: ZodType = z.object({
        status: z.enum(STATUS)
    })
}
