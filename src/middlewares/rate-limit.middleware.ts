import { rateLimit } from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'

export const rateLimiter = rateLimit({
   windowMs: 1 * 60 * 1000,
   limit: 500,
   handler: (_req, res) => {
      res
         .status(StatusCodes.TOO_MANY_REQUESTS)
         .send({ message: "Request exceeded!" })
   }
})