import z, { ZodType } from "zod"

export class TransactionsValidation {
    static readonly ADD: ZodType = z.object({
        email: z.string().min(1, "Required").email("Not valid email"),
        phone: z.number().nonnegative("Non negative number"),
        productId: z.number().nonnegative("Non negative number")
    }) 
}