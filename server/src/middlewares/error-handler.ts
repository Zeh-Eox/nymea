import type {
  ErrorRequestHandler,
  RequestHandler,
  Request,
  Response,
  NextFunction,
  Errback,
} from "express";
import { ZodError } from "zod";
import { HttpError } from "@utils/http-error";
import { logger } from "@utils/logger";

export const errorHandler: ErrorRequestHandler = (
  err: Errback,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "ValidationError",
      message: "Invalid request payload",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong",
  });
};

export const notFoundHandler: RequestHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(404).json({
    error: "NotFound",
    message: `Route ${req.method} ${req.path} not found`,
  });
};
