import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HTTP_STATUS } from "@taking-note/shared";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = result.error as ZodError;
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message
        }))
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const error = result.error as ZodError;
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Query validation failed",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message
        }))
      });
      return;
    }
    next();
  };
}
