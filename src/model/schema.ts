import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

const USERS = "users" as const
const PRODDUCTS = "products" as const
const TRANSACTIONS = "transactions" as const

export const users = mysqlTable(USERS, {
    id: int("id").primaryKey().autoincrement(),
    username: varchar("username", { length: 225 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    password: varchar("password", { length: 225 }).notNull(),
    salt: varchar("salt", { length: 225 }),
    sessionToken: varchar("sessionToken", { length: 225 }),
    createdAt: timestamp("createdAt").defaultNow()
})

export const products = mysqlTable(PRODDUCTS, {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 100 }),
    image: text("image"),
    originalPrice: int("originalPrice").notNull(),
    strikeoutPrice: int("strikeoutPrice").notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow()
})

export const productsRelations = relations(products, ({ many }) => ({
    transactions: many(products)
}))

export const transactions = mysqlTable(TRANSACTIONS, {
    id: int("id").primaryKey().autoincrement(),
    email: varchar("email", { length: 100 }).notNull(),
    phone: int("phone").notNull(),
    productId: int("productId")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow()
})

export const transactionsRelations = relations(transactions, ({ one }) => ({
    product: one(products, {
        fields: [transactions.productId],
        references: [products.id]
    })
}))