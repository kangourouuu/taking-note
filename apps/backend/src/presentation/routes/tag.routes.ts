import { Router, RequestHandler } from "express";
import { CreateTagSchema, UpdateTagSchema } from "@taking-note/shared";
import { TagController } from "../controllers/TagController";
import { validateBody } from "../middlewares/validation.middleware";

export function createTagRoutes(tagController: TagController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use(authMiddleware);
  router.get("/", tagController.getTags);
  router.get("/:id", tagController.getTagById);
  router.post("/", validateBody(CreateTagSchema), tagController.createTag);
  router.put("/:id", validateBody(UpdateTagSchema), tagController.updateTag);
  router.delete("/:id", tagController.deleteTag);

  return router;
}
