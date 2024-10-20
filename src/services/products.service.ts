import type { Request } from 'express'
import { eq, sql } from 'drizzle-orm'
import { db } from '../model/db'
import { products as productsTable } from '../model/schema'
import * as Error from '../utils/errors'
import { Validation } from '../validation/validation'
import { ProductsValidation } from '../validation/products.validation'

// import { winstonLogger } from '../utils/helpers'
import { InsertProduct, Product } from '../types'

import radash from 'radash'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

export default class ProductService {
    private static COLUMN = {
        id: productsTable.id,
        image: productsTable.image,
        title: productsTable.title,
        originalPrice: productsTable.originalPrice,
        strikeoutPrice: productsTable.strikeoutPrice,
        description: productsTable.description
    }

    static async list() {
        const products = await db
            .select(ProductService.COLUMN)
            .from(productsTable)
            .where((eq(productsTable.isOffer, false)))

        return products
    }

    // only for administrator
    static async listPrivate() {
        const products = await db
            .select({ ...ProductService.COLUMN, isOffer: productsTable.isOffer, link: productsTable.link })
            .from(productsTable)

        return products
    }

    static async getOffer() {
        const [offer] = await db
            .select(ProductService.COLUMN)
            .from(productsTable)
            .where((eq(productsTable.isOffer, true)))

        if (!offer) {
            throw new Error.ResponseError(404, `No one products has isOffer property is true`)
        }
        return offer
    }

    static async get(id: number) {
        const products = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, id))

        const [product] = products

        if (!product) {
            throw new Error.ResponseError(404, `Product not found with id ${id}`)
        }

        return product
    }

    static async add(request: Request) {
        const body = request.body as InsertProduct
        const image = request.file!

        //validation
        const productRequest = Validation.validate(ProductsValidation.ADD, body) as Product

        // validate image
        if (!radash.isObject(image)) {
            throw new Error.FileUploadError(400, "Image required")
        }

        const imageName = Date.now() + "-" + image.originalname
        const imageBuffer = image.buffer
        const imagePath = path.join(__dirname, "..", "..", "public", "static", imageName);

        const newProduct = { ...productRequest, image: imageName }

        await writeFile(imagePath, imageBuffer);

        // if request body isOffer is true, force all data that have become isOffer=false
        if (productRequest.isOffer) {
            await ProductService.forceIsOfferEqualIsFalse()
        }

        const insertNewProduct = await db
            .insert(productsTable)
            .values(newProduct)
            .$returningId()

        return { ...insertNewProduct[0], ...newProduct }

    }

    static async update(id: number, request: Request) {
        const body = request.body as InsertProduct
        const image = request.file!

        const isImageExist = radash.isObject(image)

        // validation
        const productRequest = Validation.validate(ProductsValidation.ADD, body) as Product
        // previous product
        const prevProduct = await ProductService.get(id)

        let imageName: string, imagePath: string, imageBuffer: Buffer

        // if user upload new image
        if (isImageExist) {
            imageName = Date.now() + "-" + image.originalname
            imageBuffer = image.buffer
            imagePath = path.join(__dirname, "..", "..", "public", "static", imageName);
            // add new image
            await writeFile(imagePath, imageBuffer)
            // remove previous image
            const prevImagePath = path.join(__dirname, "..", "..", "public", "static", prevProduct.image!)
            await unlink(prevImagePath)
        }

        const updateProduct = {
            ...productRequest,
            ...(isImageExist ? { image: imageName } : { image: prevProduct.image }),
            updatedAt: sql`NOW()`,
        }

        // if request body isOffer is true, force all data that have become isOffer=false
        if (updateProduct.isOffer) {
            await ProductService.forceIsOfferEqualIsFalse()
        }

        await db.update(productsTable)
            .set(updateProduct)
            .where(eq(productsTable.id, id))

    }

    static async remove(id: number) {
        // check are there product ?
        const product = await ProductService.get(id)
        // remove image from static dir
        const imagePath = path.join(__dirname, "..", "..", "public", "static", product.image!)
        await unlink(imagePath)

        // if exist, remove it from db
        await db.delete(productsTable)
            .where(eq(productsTable.id, id))
    }

    static async forceIsOfferEqualIsFalse() {
        const data = { isOffer: false } as unknown as InsertProduct
        await db.update(productsTable).set(data)
    }
}