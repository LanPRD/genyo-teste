import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      HttpStatus.NOT_FOUND,
      `${resource.toUpperCase()}_NOT_FOUND`,
      id ? `${resource} with id ${id} not found` : `${resource} not found`
    );
  }
}
