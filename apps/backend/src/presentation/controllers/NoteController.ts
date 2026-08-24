import { Response, NextFunction } from "express";
import { HTTP_STATUS, CreateNoteDto, UpdateNoteDto, NoteFilterQueryDto } from "@taking-note/shared";
import { NoteService } from "../../application/services/NoteService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../domain/errors/DomainErrors";

export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  public getNotes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const filter: NoteFilterQueryDto = {
        projectId: req.query["projectId"] as string | undefined,
        month: req.query["month"] as string | undefined,
        tagIds: req.query["tagIds"] as string | undefined
      };
      const notes = await this.noteService.getNotes(req.user.userId, filter);
      res.status(HTTP_STATUS.OK).json(notes);
    } catch (err) {
      next(err);
    }
  };

  public getNoteById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const note = await this.noteService.getNoteById(req.params["id"] as string, req.user.userId);
      res.status(HTTP_STATUS.OK).json(note);
    } catch (err) {
      next(err);
    }
  };

  public createNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = req.body as CreateNoteDto;
      const note = await this.noteService.createNote(req.user.userId, dto);
      res.status(HTTP_STATUS.CREATED).json(note);
    } catch (err) {
      next(err);
    }
  };

  public updateNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = req.body as UpdateNoteDto;
      const note = await this.noteService.updateNote(req.params["id"] as string, req.user.userId, dto);
      res.status(HTTP_STATUS.OK).json(note);
    } catch (err) {
      next(err);
    }
  };

  public deleteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      await this.noteService.deleteNote(req.params["id"] as string, req.user.userId);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
