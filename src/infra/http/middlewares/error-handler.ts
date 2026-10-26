import { AppError, HttpStatus } from "@/core/errors";
import type { ErrorRequestHandler } from "express";

interface BodyParserError extends Error {
  type?: string;
  status?: number;
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  const bodyError = error as BodyParserError;

  // Malformed JSON, payload too large, unsupported charset, etc.
  if (bodyError.type?.startsWith("entity.") && bodyError.status) {
    res.status(bodyError.status).json({
      error: "BAD_REQUEST",
      message: bodyError.message
    });

    return;
  }

  console.error(error);

  res.status(HttpStatus.INTERNAL).json({
    error: "INTERNAL_ERROR",
    message: "Unexpected internal error"
  });
};
