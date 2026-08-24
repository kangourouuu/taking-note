import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { ProjectController } from "../controllers/ProjectController";
import { TagController } from "../controllers/TagController";
import { NoteController } from "../controllers/NoteController";
import { createAuthMiddleware } from "../middlewares/auth.middleware";
import { IJwtService } from "../../application/contracts/ISecurityServices";
import { createAuthRoutes } from "./auth.routes";
import { createProjectRoutes } from "./project.routes";
import { createTagRoutes } from "./tag.routes";
import { createNoteRoutes } from "./note.routes";

export interface RouteDependencies {
  authController: AuthController;
  projectController: ProjectController;
  tagController: TagController;
  noteController: NoteController;
  jwtService: IJwtService;
}

export function createApiRouter(deps: RouteDependencies): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(deps.jwtService);

  router.use("/auth", createAuthRoutes(deps.authController, authMiddleware));
  router.use("/projects", createProjectRoutes(deps.projectController, authMiddleware));
  router.use("/tags", createTagRoutes(deps.tagController, authMiddleware));
  router.use("/notes", createNoteRoutes(deps.noteController, authMiddleware));

  return router;
}
