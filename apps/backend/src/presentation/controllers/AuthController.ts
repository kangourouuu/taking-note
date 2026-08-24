import { Response, NextFunction } from "express";
import { HTTP_STATUS, RegisterRequestDto, LoginRequestDto } from "@taking-note/shared";
import { AuthService } from "../../application/services/AuthService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../domain/errors/DomainErrors";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RegisterRequestDto;
      const result = await this.authService.register(dto);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginRequestDto;
      const result = await this.authService.login(dto);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const result = await this.authService.getMe(req.user.userId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
