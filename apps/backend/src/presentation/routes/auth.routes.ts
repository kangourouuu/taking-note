import { Router, RequestHandler } from "express";
import { RegisterRequestSchema, LoginRequestSchema } from "@taking-note/shared";
import { AuthController } from "../controllers/AuthController";
import { validateBody } from "../middlewares/validation.middleware";

export function createAuthRoutes(authController: AuthController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.post("/register", validateBody(RegisterRequestSchema), authController.register);
  router.post("/login", validateBody(LoginRequestSchema), authController.login);
  router.get("/me", authMiddleware, authController.getMe);

  return router;
}
