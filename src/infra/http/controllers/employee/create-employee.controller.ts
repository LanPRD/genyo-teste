import type { CreateEmployeeDto } from "@/application/dtos";
import type { CreateEmployeeUseCase } from "@/application/use-cases/employees";
import { HttpStatus } from "@/core/errors";
import type { Request, Response } from "express";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

export class CreateEmployeeController {
  constructor(private readonly createEmployee: CreateEmployeeUseCase) {}

  async handle(req: Request, res: Response) {
    const result = await this.createEmployee.execute(
      req.body as CreateEmployeeDto
    );

    if (result.isLeft()) {
      throw result.value;
    }

    res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee)));
  }
}
