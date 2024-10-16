import express from 'express';
import AuthController from '../controllers/auth.controller';
import UsersController from '../controllers/users.controller';
import ProductsController from '../controllers/products.controller';
import PaymentController from '../controllers/payment.controller';
import { accessValidation } from '../middlewares/auth.middleware';
import { fileUpload } from '../lib/file-upload';
import { TransactionsController } from '../controllers/transaction.controller';

const apiRouter = express.Router()

// auth
apiRouter.post("/api/auth/register", AuthController.register)
apiRouter.post("/api/auth/login", AuthController.login)

// users
// apiRouter.get("/api/user/list", accessValidation, UsersController.list)
apiRouter.get("/api/user/:id", accessValidation, UsersController.get)
// apiRouter.delete("/api/user/:id/remove", accessValidation, UsersController.remove)

// products
apiRouter.get("/api/product/list/public", ProductsController.list)
apiRouter.get("/api/product/offer/public", ProductsController.getOffer)

apiRouter.get("/api/product/list", accessValidation, ProductsController.listPrivate)
apiRouter.get("/api/product/:id", accessValidation, ProductsController.get)
apiRouter.post("/api/product/add", [accessValidation, fileUpload.single("image")], ProductsController.add)
apiRouter.put("/api/product/:id/update", [accessValidation, fileUpload.single("image")], ProductsController.update)
apiRouter.delete("/api/product/:id/remove", accessValidation, ProductsController.remove)

//transactions
apiRouter.get("/api/transaction/list", accessValidation, TransactionsController.list)
apiRouter.get("/api/transaction/:id", accessValidation, TransactionsController.get)
// apiRouter.post("/api/transaction/add", accessValidation, TransactionsController.add)
// apiRouter.patch("/api/transaction/:id/update-status", TransactionsController.updateStatus)
// apiRouter.delete("/api/transaction/:id/remove", accessValidation, TransactionsController.remove)

// payment
apiRouter.post("/api/payment/invoice/create", PaymentController.createInvoice)
apiRouter.post("/api/payment/webhook", PaymentController.webhook)
apiRouter.get("/api/payment/email/sender", PaymentController.emailSender)

export default apiRouter

