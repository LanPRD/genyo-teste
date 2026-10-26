import type { GetUserByIdUseCase } from "@/application/use-cases/users";
import type { Request, Response } from "express";
import { UserPresenter } from "../../presenters/user-presenter";
import { ApiResponse } from "../../response";

export class GetUserByIdController {
  constructor(private readonly getUserById: GetUserByIdUseCase) {}

  async handle(req: Request<{ id: string }>, res: Response) {
    const result = await this.getUserById.execute(req.params.id);

    if (result.isLeft()) {
      throw result.value;
    }

    res.json(ApiResponse.ok(UserPresenter.toHTTP(result.value.user)));
  }
}
