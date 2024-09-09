import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../model/db'
import { products as productsTable } from '../model/schema'
import { ResponseError } from '../utils/response-error'
import { Validation } from '../validation/validation'
import { ProductsValidation } from '../validation/products.validation'

import { winstonLogger } from '../utils/helpers'
import { InsertProduct } from '../types'
import { FileUploadError } from '../utils/file-upload-error'

import radash from 'radash'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

export default class ProductService {

    static async list() {
        const products = await db
            .select()
            .from(productsTable)

        return products
    }

    static async get(id: number) {
        const products = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, id))

        const product = products[0]

        if (!radash.isObject(product)) {
            throw new ResponseError(404, `Product not found with id ${id}`)
        }

        return product
    }

    static async add(request: Request) {
        const body = request.body as InsertProduct
        const image = request.file!

        const productRequest = Validation.validate(ProductsValidation.ADD, body)

        // validate image
        if (!radash.isObject(image)) {
            throw new FileUploadError(400, "Image required")
        }

        const imageName = Date.now() + "-" + image.originalname
        const imageBuffer = image.buffer
        const imagePath = path.join(__dirname, "..", "..", "public", "static", imageName);

        const newProduct = { ...productRequest, image: imageName }

        await writeFile(imagePath, imageBuffer);

        const insertNewProduct = await db
            .insert(productsTable)
            .values(newProduct)
            .$returningId()

        return { ...insertNewProduct[0], ...newProduct }

    }

    static async update() { }

    static async remove(id: number) {
        // check are there product ?
        const product = await ProductService.get(id)

        // if exist, remove it from db
        await db.delete(productsTable)
        .where(eq(productsTable.id, id))

        // remove image from static dir
        const imagePath = path.join(__dirname, "..", "..", "public", "static", product.image!)
        await unlink(imagePath)
    }
}