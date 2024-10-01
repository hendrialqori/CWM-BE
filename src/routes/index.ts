import express from 'express';
import AuthController from '../controllers/auth.controller';
import UsersController from '../controllers/users.controller';
import ProductsController from '../controllers/products.controller';
import { isAuthenticate } from '../middlewares/auth.middleware';
import { fileUpload } from '../lib/file-upload';
import { TransactionsController } from '../controllers/transaction.controller';

const apiRouter = express.Router()

// auth
apiRouter.post("/api/auth/register", AuthController.register)
apiRouter.post("/api/auth/login", AuthController.login)
apiRouter.get("/api/auth/profile", AuthController.profile)
apiRouter.delete("/api/auth/logout", AuthController.logout)

// users
apiRouter.get("/api/user/list", UsersController.list)
apiRouter.get("/api/user/:id", UsersController.get)
apiRouter.delete("/api/user/:id/remove", UsersController.remove)

// products
apiRouter.get("/api/product/list", ProductsController.list)
apiRouter.get("/api/product/:id", ProductsController.get)
apiRouter.post("/api/product/add", [fileUpload.single("image")], ProductsController.add)
apiRouter.put("/api/product/:id/update", [fileUpload.single("image")], ProductsController.update)
apiRouter.delete("/api/product/:id/remove", ProductsController.remove)

//transactions
apiRouter.get("/api/transaction/list", TransactionsController.list)
apiRouter.get("/api/transaction/:id", TransactionsController.get)
apiRouter.post("/api/transaction/add", TransactionsController.add)
apiRouter.delete("/api/transaction/:id/remove", TransactionsController.remove)


export default apiRouter

