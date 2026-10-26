import type { CreateUserDto } from "@/application/dtos";
import type { CreateUserUseCase } from "@/application/use-cases/users";
import { HttpStatus } from "@/core/errors";
import type { Request, Response } from "express";
import { UserPresenter } from "../../presenters/user-presenter";
import { ApiResponse } from "../../response";

export class CreateUserController {
  constructor(private readonly createUser: CreateUserUseCase) {}

  async handle(req: Request, res: Response) {
    const result = await this.createUser.execute(req.body as CreateUserDto);

    if (result.isLeft()) {
      throw result.value;
    }

    res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.ok(UserPresenter.toHTTP(result.value.user)));
  }
}
