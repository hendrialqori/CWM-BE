import { rateLimit } from 'express-rate-limit'

export const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 500,
    handler: (req, res) => {
        res.status(429).json({ message: "Request exceeded!" })
    }
})