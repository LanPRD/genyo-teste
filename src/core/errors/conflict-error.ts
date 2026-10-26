import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, "CONFLICT", message);
  }
}
