import type { ListEmployeesDto } from "@/application/dtos";
import type { ListEmployeesUseCase } from "@/application/use-cases/employees";
import { HttpStatus } from "@/core/errors";
import type { Request, Response } from "express";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

export class ListEmployeesController {
  constructor(private readonly listEmployees: ListEmployeesUseCase) {}

  async handle(req: Request, res: Response) {
    const result = await this.listEmployees.execute(
      req.query as ListEmployeesDto
    );

    if (result.isLeft()) {
      throw result.value;
    }

    const { employees, limit, nextCursor } = result.value;

    res.status(HttpStatus.OK).json(
      ApiResponse.paginated(employees.map(EmployeePresenter.toHTTP), {
        limit,
        nextCursor
      })
    );
  }
}
