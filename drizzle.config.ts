import { Config, defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
    schema: [
        "./src/model/schema.ts"
    ],
    out: "./src/drizzle/migrations",
    dialect: "mysql",
    dbCredentials: {
        url: process.env.DATABASE_URL!
        // host: process.env.HOST!,
        // user: process.env.USER!,
        // password: process.env.PASSWORD!,
        // database: process.env.NAME!,
        // port: 3306
    }
}) satisfies Config