export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorType: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: this.errorType,
      message: this.message,
      ...(this.details !== undefined && { details: this.details })
    };
  }
}
