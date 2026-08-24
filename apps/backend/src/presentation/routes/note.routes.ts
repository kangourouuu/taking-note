import { Router, RequestHandler } from "express";
import { CreateNoteSchema, UpdateNoteSchema, NoteFilterQuerySchema } from "@taking-note/shared";
import { NoteController } from "../controllers/NoteController";
import { validateBody, validateQuery } from "../middlewares/validation.middleware";

export function createNoteRoutes(noteController: NoteController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use(authMiddleware);
  router.get("/", validateQuery(NoteFilterQuerySchema), noteController.getNotes);
  router.get("/:id", noteController.getNoteById);
  router.post("/", validateBody(CreateNoteSchema), noteController.createNote);
  router.put("/:id", validateBody(UpdateNoteSchema), noteController.updateNote);
  router.delete("/:id", noteController.deleteNote);

  return router;
}
