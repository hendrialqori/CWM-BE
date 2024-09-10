import express from 'express';
import AuthController from '../controllers/auth.controller';
import UsersController from '../controllers/users.controller';
import ProductsController from '../controllers/products.controller';
import { isAuthenticate } from '../middlewares/auth.middleware';
import { fileUpload } from '../lib/file-upload';
import { TransactionsController } from '../controllers/transaction.controller';

const apiRouter = express.Router()

apiRouter.post("/api/auth/register", AuthController.register)
apiRouter.post("/api/auth/login", AuthController.login)
apiRouter.delete("/api/auth/logout", AuthController.logout)

apiRouter.get("/api/user/list", isAuthenticate, UsersController.list)
apiRouter.get("/api/user/:id", isAuthenticate, UsersController.get)
apiRouter.delete("/api/user/:id/remove", isAuthenticate, UsersController.remove)

// products
apiRouter.get("/api/product/list", isAuthenticate, ProductsController.list)
apiRouter.get("/api/product/:id", isAuthenticate, ProductsController.get)
apiRouter.post("/api/product/add", [isAuthenticate, fileUpload.single("image")], ProductsController.add)
apiRouter.put("/api/product/:id/update", [isAuthenticate, fileUpload.single("image")], ProductsController.update)
apiRouter.delete("/api/product/:id/remove", isAuthenticate, ProductsController.remove)

//transactions
apiRouter.get("/api/transaction/list", isAuthenticate, TransactionsController.list)
apiRouter.get("/api/transaction/:id", isAuthenticate, TransactionsController.get)
apiRouter.post("/api/transaction/add", isAuthenticate, TransactionsController.add)
apiRouter.delete("/api/transaction/:id/remove", isAuthenticate, TransactionsController.remove)


export default apiRouter

