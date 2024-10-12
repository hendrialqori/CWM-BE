import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import compression from "compression"
import cookieParser from "cookie-parser"
import helmet from "helmet"

import { logger } from "./utils/helpers";
import apiRouter from "./routes";
import { errorResponse } from "./middlewares/error.middleware";
import { rateLimiter } from "./middlewares/rate-limit.middleware";
import morgan from "morgan"

dotenv.config()

const PORT = 8000

const app = express()

app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN
}))

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

app.use(rateLimiter)

app.use(compression())

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(helmet());

//serve static file
app.use(express.static("public"))

// cookie middleware
app.use(cookieParser())

// api router 
app.use(apiRouter)

// ping API
app.get("/api/ping", (req, res) => {
    res.status(200).json({ message: "PING!", time: new Date() })
})

// error response middleware
app.use(errorResponse)

// logger request
app.use(logger)

app.listen(PORT, () => {
    // winstonLogger.info
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});