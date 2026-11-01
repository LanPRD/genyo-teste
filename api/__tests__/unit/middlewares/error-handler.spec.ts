import { ValidationError } from "@/core/errors";
import { errorHandler } from "@/infra/http/middlewares/error-handler";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

vi.spyOn(console, "error").mockImplementation(() => {});

function makeRes() {
  const res = { headersSent: false, status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);

  return res;
}

function handle(error: unknown, res: ReturnType<typeof makeRes>) {
  return errorHandler(
    error,
    {} as Request,
    res as unknown as Response,
    vi.fn() as NextFunction
  );
}

describe("errorHandler", () => {
  it("formats ZodError details of a ValidationError by field", () => {
    // Arrange
    const res = makeRes();

    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      address: z.object({ street: z.string().min(1, "Street is required") })
    });

    const parsed = schema.safeParse({ name: "", address: { street: "" } });

    const error = new ValidationError(
      "Invalid data",
      parsed.success ? undefined : parsed.error
    );

    // Act
    handle(error, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "VALIDATION_ERROR",
      message: "Invalid data",
      details: [
        { field: "name", message: "Name is required" },
        { field: "address.street", message: "Street is required" }
      ]
    });
  });

  it("keeps details of a ValidationError that is not a ZodError", () => {
    // Arrange
    const res = makeRes();
    const details = [{ field: "name", message: "custom" }];
    const error = new ValidationError("Invalid data", details);

    // Act
    handle(error, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "VALIDATION_ERROR",
      message: "Invalid data",
      details
    });
  });

  it("returns 500 without leaking the message of an unknown error", () => {
    // Arrange
    const res = makeRes();
    const error = new Error("db password is hunter2");

    // Act
    handle(error, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "INTERNAL_ERROR",
      message: "Unexpected internal error"
    });
  });
});
