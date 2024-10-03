import z, { ZodType } from "zod"
import { STATUS } from "../constant"

export class TransactionsValidation {
    static readonly ADD: ZodType = z.object({
        email: z.string().min(1, "Required").email("Not valid email"),
        phone: z.number().nonnegative("Non negative number"),
        productId: z.number().nonnegative("Non negative number")
    }) 

    static readonly UPDATE_STATUS: ZodType = z.object({
        status: z.enum(STATUS)
    })
}
