import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class InternalError extends AppError {
  constructor(message = "Unexpected internal error") {
    super(HttpStatus.INTERNAL, "INTERNAL_ERROR", message);
  }
}
