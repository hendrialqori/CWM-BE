import { mysqlTable, mysqlEnum, int, bigint, varchar, text, timestamp, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { STATUS } from '../constant';

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
    link: text("link"),
    description: text("description"),
    isOffer: boolean("isOffer").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow()
})

export const productsRelations = relations(products, ({ many }) => ({
    transactions: many(products)
}))

export const transactions = mysqlTable(TRANSACTIONS, {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 225 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    phone: bigint("phone", { mode: "number" }).notNull(),
    productId: int("productId")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    invoiceId: text("invoiceId").notNull(),
    invoiceUrl: text("invoiceUrl").notNull(),
    status: mysqlEnum("status", STATUS).default("PENDING"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow()
})

export const transactionsRelations = relations(transactions, ({ one }) => ({
    product: one(products, {
        fields: [transactions.productId],
        references: [products.id]
    })
}))