import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "@taking-note/shared";
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../domain/errors/DomainErrors";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof NotFoundError) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ error: err.message });
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: err.message });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(HTTP_STATUS.CONFLICT).json({ error: err.message });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: "Internal server error"
  });
}
