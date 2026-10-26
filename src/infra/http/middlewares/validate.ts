import { ValidationError } from "@/core/errors";
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

export function validate(
  schema: ZodType,
  source: Source = "body"
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      throw new ValidationError("Validation failed", details);
    }

    if (source === "body") {
      req.body = result.data;
    }

    next();
  };
}
