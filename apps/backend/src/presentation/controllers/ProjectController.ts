import { Response, NextFunction } from "express";
import { HTTP_STATUS, CreateProjectDto, UpdateProjectDto } from "@taking-note/shared";
import { ProjectService } from "../../application/services/ProjectService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../domain/errors/DomainErrors";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const projects = await this.projectService.getProjects(req.user.userId);
      res.status(HTTP_STATUS.OK).json(projects);
    } catch (err) {
      next(err);
    }
  };

  public getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const project = await this.projectService.getProjectById(req.params["id"] as string, req.user.userId);
      res.status(HTTP_STATUS.OK).json(project);
    } catch (err) {
      next(err);
    }
  };

  public createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = req.body as CreateProjectDto;
      const project = await this.projectService.createProject(req.user.userId, dto);
      res.status(HTTP_STATUS.CREATED).json(project);
    } catch (err) {
      next(err);
    }
  };

  public updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = req.body as UpdateProjectDto;
      const project = await this.projectService.updateProject(req.params["id"] as string, req.user.userId, dto);
      res.status(HTTP_STATUS.OK).json(project);
    } catch (err) {
      next(err);
    }
  };

  public deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      await this.projectService.deleteProject(req.params["id"] as string, req.user.userId);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
