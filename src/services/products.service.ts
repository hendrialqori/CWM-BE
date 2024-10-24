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
import { generateMD5 } from 'src/utils/helpers'

export default class ProductService {

    private static COLUMN = {
        id: productsTable.id,
        image: productsTable.image,
        title: productsTable.title,
        originalPrice: productsTable.originalPrice,
        strikeoutPrice: productsTable.strikeoutPrice,
        description: productsTable.description,
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
            .select({ ...ProductService.COLUMN, isOffer: productsTable.isOffer })
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
        const imageFile = request.files['image'][0] as Express.Multer.File
        const zipFile = request.files["zip"][0] as Express.Multer.File

        //validation product body
        const productRequest = Validation.validate(ProductsValidation.ADD, body) as Product

        // validation image and zip
        const isImage = radash.isObject(imageFile)
        const isZip = radash.isObject(zipFile)

        // validate image and zip file
        if (!isImage) throw new Error.FileUploadError(400, "Image required")
        if (!isZip) throw new Error.FileUploadError(400, "Zip file required")

        const imageName = Date.now() + "-" + imageFile.originalname
        const imageBuffer = imageFile.buffer
        const imagePath = path.join(__dirname, "..", "..", "public", "static", imageName);

        const zipName = `${Date.now()}-${zipFile.originalname}`
        const zipBuffer = zipFile.buffer
        const zipPath = path.join(__dirname, "..", "..", "_zip", zipName);

        // store image file into directory
        await writeFile(imagePath, imageBuffer);
        // store zip file into directory
        await writeFile(zipPath, zipBuffer)

        // if request body isOffer is true, force all data that have become isOffer=false
        if (productRequest.isOffer) {
            await ProductService.forceIsOfferEqualIsFalse()
        }

        // store zip file into database
        const zipMd5 = await generateMD5(zipPath)
        const newProduct = {
            ...productRequest,
            image: imageName,
            zipPath: zipName,
            zipMd5
        } as Product

        // store into database
        const [result] = await db
            .insert(productsTable)
            .values(newProduct)
            .$returningId()

        return { ...result, ...newProduct }
    }

    static async update(id: number, request: Request) {
        const body = request.body as InsertProduct
        const imageFile = request.files['image']?.[0] as Express.Multer.File
        const zipFile = request.files["zip"]?.[0] as Express.Multer.File

        // validation image and zip
        const isImage = radash.isObject(imageFile)
        const isZip = radash.isObject(zipFile)

        // validation
        const productRequest = Validation.validate(ProductsValidation.ADD, body) as Product
        const updateProductPayload = structuredClone(productRequest)

        // previous product
        const prevProduct = await ProductService.get(id)

        // if user upload new image
        if (isImage) {
            const imageName = `${Date.now()}-${imageFile.originalname}`
            const imageBuffer = imageFile.buffer
            const imagePath = path.join(__dirname, "..", "..", "public", "static", imageName);
            // insert new image
            await writeFile(imagePath, imageBuffer)
            // remove previous image
            const prevImagePath = path.join(__dirname, "..", "..", "public", "static", prevProduct.image)
            await unlink(prevImagePath)

            updateProductPayload.image = imageName
        }

        // if user upload new zip file
        if (isZip) {
            const zipName = `${Date.now()}-${zipFile.originalname}`
            const zipBuffer = imageFile.buffer
            const zipPath = path.join(__dirname, "..", "..", "_zip", zipName);
            // insert new zip
            await writeFile(zipPath, zipBuffer)
            // generate new MD%
            const zipMd5 = await generateMD5(zipPath)
            // remove previous zip
            const prevZipPath = path.join(__dirname, "..", "..", "_zip", prevProduct.zipPath)
            await unlink(prevZipPath)

            updateProductPayload.zipPath = zipName
            updateProductPayload.zipMd5 = zipMd5
        }

        updateProductPayload.updatedAt = sql`NOW()` as unknown as Date


        // if request body isOffer is true, force all data that have become isOffer=false
        if (updateProductPayload.isOffer) {
            await ProductService.forceIsOfferEqualIsFalse()
        }

        await db.update(productsTable)
            .set(updateProductPayload)
            .where(eq(productsTable.id, id))

    }

    static async remove(id: number) {
        // check are there product ?
        const product = await ProductService.get(id)
        // remove image from static dir
        const imagePath = path.join(__dirname, "..", "..", "public", "static", product.image)
        const zipPath = path.join(__dirname, "..", "..", "_zip", product.zipPath)
        
        await unlink(imagePath)
        await unlink(zipPath)

        // if exist, remove it from db
        await db.delete(productsTable)
            .where(eq(productsTable.id, id))
    }

    static async forceIsOfferEqualIsFalse() {
        const data = { isOffer: false } as unknown as InsertProduct
        await db.update(productsTable).set(data)
    }
}