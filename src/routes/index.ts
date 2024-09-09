import express from 'express';
import AuthController from '../controllers/auth.controller';
import UsersController from '../controllers/users.controller';
import ProductController from '../controllers/products.controller';
import { isAuthenticate } from '../middlewares/auth.middleware';
import { fileUpload } from '../lib/file-upload';

const apiRouter = express.Router()

apiRouter.post("/api/auth/register", AuthController.register)
apiRouter.post("/api/auth/login", AuthController.login)
apiRouter.delete("/api/auth/logout", AuthController.logout)

apiRouter.get("/api/user/list", isAuthenticate, UsersController.list)
apiRouter.get("/api/user/:id", isAuthenticate, UsersController.get)
apiRouter.delete("/api/user/:id/remove", isAuthenticate, UsersController.remove)

apiRouter.get("/api/product/list", isAuthenticate, ProductController.list)
apiRouter.get("/api/product/:id", isAuthenticate, ProductController.get)
apiRouter.post("/api/product/add", fileUpload.single("image") ,ProductController.add)
apiRouter.delete("/api/product/:id/remove", isAuthenticate, ProductController.remove)



export default apiRouter

