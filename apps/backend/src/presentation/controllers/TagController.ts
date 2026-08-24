import { Response, NextFunction } from "express";
import { HTTP_STATUS, CreateTagDto, UpdateTagDto } from "@taking-note/shared";
import { TagService } from "../../application/services/TagService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../domain/errors/DomainErrors";

export class TagController {
  constructor(private readonly tagService: TagService) {}

  public getTags = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const projectId = req.query["projectId"] as string | undefined;
      const tags = await this.tagService.getTags(req.user.userId, projectId);
      res.status(HTTP_STATUS.OK).json(tags);
    } catch (err) {
      next(err);
    }
  };

  public getTagById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const tag = await this.tagService.getTagById(req.params["id"] as string, req.user.userId);
      res.status(HTTP_STATUS.OK).json(tag);
    } catch (err) {
      next(err);
    }
  };

  public createTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = req.body as CreateTagDto;
      const tag = await this.tagService.createTag(req.user.userId, dto);
      res.status(HTTP_STATUS.CREATED).json(tag);
    } catch (err) {
      next(err);
    }
  };

  public updateTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = req.body as UpdateTagDto;
      const tag = await this.tagService.updateTag(req.params["id"] as string, req.user.userId, dto);
      res.status(HTTP_STATUS.OK).json(tag);
    } catch (err) {
      next(err);
    }
  };

  public deleteTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      await this.tagService.deleteTag(req.params["id"] as string, req.user.userId);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
