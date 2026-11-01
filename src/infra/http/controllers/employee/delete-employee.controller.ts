import type { DeleteEmployeeUseCase } from "@/application/use-cases/employees";
import { HttpStatus } from "@/core/errors";
import type { Request, Response } from "express";

export class DeleteEmployeeController {
  constructor(private readonly deleteEmployee: DeleteEmployeeUseCase) {}

  async handle(req: Request, res: Response) {
    const result = await this.deleteEmployee.execute(req.params.id as string);

    if (result.isLeft()) {
      throw result.value;
    }

    res.status(HttpStatus.NO_CONTENT).json();
  }
}
