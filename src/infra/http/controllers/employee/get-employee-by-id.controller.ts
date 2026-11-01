import type { GetEmployeeByIdUseCase } from "@/application/use-cases/employees";
import type { Request, Response } from "express";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

export class GetEmployeeByIdController {
  constructor(private readonly getEmployeeById: GetEmployeeByIdUseCase) {}

  async handle(req: Request<{ id: string }>, res: Response) {
    const result = await this.getEmployeeById.execute(req.params.id);

    if (result.isLeft()) {
      throw result.value;
    }

    res.json(ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee)));
  }
}
