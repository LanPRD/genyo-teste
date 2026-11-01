import { Router } from "express";
import type { CreateEmployeeController } from "./create-employee.controller";
import type { DeleteEmployeeController } from "./delete-employee.controller";
import type { GetEmployeeByIdController } from "./get-employee-by-id.controller";
import type { ListEmployeesController } from "./list-employees.controller";

interface EmployeeControllers {
  createEmployee: CreateEmployeeController;
  deleteEmployee: DeleteEmployeeController;
  listEmployees: ListEmployeesController;
  getEmployeeById: GetEmployeeByIdController;
}

export function createEmployeeRoutes(controllers: EmployeeControllers) {
  const router = Router();

  router.post("/", (req, res) => controllers.createEmployee.handle(req, res));

  router.get("/", (req, res) => controllers.listEmployees.handle(req, res));

  router.delete("/:id", (req, res) =>
    controllers.deleteEmployee.handle(req, res)
  );

  router.get("/:id", (req, res) =>
    controllers.getEmployeeById.handle(req, res)
  );

  return router;
}
