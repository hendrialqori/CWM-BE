import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv"
dotenv.config()

export const poolConnection = mysql.createPool({
    uri: process.env.DATABASE_URL
});

export const db = drizzle(poolConnection);