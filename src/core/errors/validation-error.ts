import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message, details);
  }
}
