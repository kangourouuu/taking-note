import { Request, Response, NextFunction } from "express";
import { IJwtService } from "../../application/contracts/ISecurityServices";
import { UnauthorizedError } from "../../domain/errors/DomainErrors";

export interface AuthenticatedUser {
  userId: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function createAuthMiddleware(jwtService: IJwtService) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing or invalid Authorization header"));
    }

    const token = authHeader.substring(7);
    try {
      const payload = jwtService.verify(token);
      req.user = payload;
      return next();
    } catch {
      return next(new UnauthorizedError("Invalid or expired authentication token"));
    }
  };
}
