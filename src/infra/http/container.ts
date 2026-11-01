import {
  CreateEmployeeUseCase,
  GetEmployeeByIdUseCase
} from "@/application/use-cases/employees";
import type { EmployeeRepository } from "@/domain/repositories";
import { CreateEmployeeController } from "./controllers/employee/create-employee.controller";
import { GetEmployeeByIdController } from "./controllers/employee/get-employee-by-id.controller";
import {
  HealthController,
  type DatabaseCheck
} from "./health/health.controller";

export interface ContainerDeps {
  employeeRepository: EmployeeRepository;
  checkDatabase: DatabaseCheck;
}

export function createContainer({
  employeeRepository,
  checkDatabase
}: ContainerDeps) {
  const createEmployee = new CreateEmployeeUseCase(employeeRepository);
  const getEmployeeById = new GetEmployeeByIdUseCase(employeeRepository);

  return {
    health: new HealthController(checkDatabase),
    employee: {
      createEmployee: new CreateEmployeeController(createEmployee),
      getEmployeeById: new GetEmployeeByIdController(getEmployeeById)
    }
  };
}

export type Container = ReturnType<typeof createContainer>;
