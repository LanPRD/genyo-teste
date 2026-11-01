import type { ListEmployeesUseCase } from "@/application/use-cases/employees";
import { HttpStatus } from "@/core/errors";
import type { Request, Response } from "express";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

export class ListEmployeesController {
  constructor(private readonly listEmployees: ListEmployeesUseCase) {}

  async handle(_req: Request, res: Response) {
    const result = await this.listEmployees.execute();

    if (result.isLeft()) {
      throw result.value;
    }

    res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.ok(result.value.employees.map(EmployeePresenter.toHTTP))
      );
  }
}
