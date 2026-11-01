import type { UpdateEmployeeDto } from "@/application/dtos";
import type { UpdateEmployeeUseCase } from "@/application/use-cases/employees";
import type { Request, Response } from "express";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

export class UpdateEmployeeController {
  constructor(private readonly updateEmployee: UpdateEmployeeUseCase) {}

  async handle(req: Request, res: Response) {
    const result = await this.updateEmployee.execute(
      req.params.id as string,
      req.body as UpdateEmployeeDto
    );

    if (result.isLeft()) {
      throw result.value;
    }

    res.json(ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee)));
  }
}
