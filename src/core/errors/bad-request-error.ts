import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
  }
}
