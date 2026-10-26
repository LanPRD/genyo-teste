import { HttpStatus } from "@/core/errors";
import type { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.path} not found`
  });
};
