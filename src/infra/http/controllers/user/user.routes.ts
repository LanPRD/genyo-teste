import { CreateUserSchema } from "@/application/dtos";
import { Router } from "express";
import { validate } from "../../middlewares/validate";
import type { CreateUserController } from "./create-user.controller";
import type { GetUserByIdController } from "./get-user-by-id.controller";

interface UserControllers {
  createUser: CreateUserController;
  getUserById: GetUserByIdController;
}

export function createUserRoutes(controllers: UserControllers) {
  const router = Router();

  router.post("/", validate(CreateUserSchema), (req, res) =>
    controllers.createUser.handle(req, res)
  );

  router.get("/:id", (req, res) => controllers.getUserById.handle(req, res));

  return router;
}
