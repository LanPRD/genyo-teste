import { CreateEmployeeSchema } from "@/application/dtos";
import { Router } from "express";
import { validate } from "../../middlewares/validate";
import type { CreateEmployeeController } from "./create-employee.controller";
import type { GetEmployeeByIdController } from "./get-employee-by-id.controller";

interface EmployeeControllers {
  createEmployee: CreateEmployeeController;
  getEmployeeById: GetEmployeeByIdController;
}

export function createEmployeeRoutes(controllers: EmployeeControllers) {
  const router = Router();

  router.post("/", validate(CreateEmployeeSchema), (req, res) =>
    controllers.createEmployee.handle(req, res)
  );

  router.get("/:id", (req, res) =>
    controllers.getEmployeeById.handle(req, res)
  );

  return router;
}
