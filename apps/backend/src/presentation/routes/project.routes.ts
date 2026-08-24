import { Router, RequestHandler } from "express";
import { CreateProjectSchema, UpdateProjectSchema } from "@taking-note/shared";
import { ProjectController } from "../controllers/ProjectController";
import { validateBody } from "../middlewares/validation.middleware";

export function createProjectRoutes(projectController: ProjectController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use(authMiddleware);
  router.get("/", projectController.getProjects);
  router.get("/:id", projectController.getProjectById);
  router.post("/", validateBody(CreateProjectSchema), projectController.createProject);
  router.put("/:id", validateBody(UpdateProjectSchema), projectController.updateProject);
  router.delete("/:id", projectController.deleteProject);

  return router;
}
