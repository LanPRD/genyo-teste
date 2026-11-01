import {
  CreateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetEmployeeByIdUseCase,
  ListEmployeesUseCase,
  UpdateEmployeeUseCase
} from "@/application/use-cases/employees";
import type { EmployeeRepository } from "@/domain/repositories";
import { CreateEmployeeController } from "./controllers/employee/create-employee.controller";
import { DeleteEmployeeController } from "./controllers/employee/delete-employee.controller";
import { GetEmployeeByIdController } from "./controllers/employee/get-employee-by-id.controller";
import { ListEmployeesController } from "./controllers/employee/list-employees.controller";
import { UpdateEmployeeController } from "./controllers/employee/update-employee.controller";
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
  const deleteEmployee = new DeleteEmployeeUseCase(employeeRepository);
  const listEmployees = new ListEmployeesUseCase(employeeRepository);
  const updateEmployee = new UpdateEmployeeUseCase(employeeRepository);

  return {
    health: new HealthController(checkDatabase),
    employee: {
      createEmployee: new CreateEmployeeController(createEmployee),
      getEmployeeById: new GetEmployeeByIdController(getEmployeeById),
      deleteEmployee: new DeleteEmployeeController(deleteEmployee),
      listEmployees: new ListEmployeesController(listEmployees),
      updateEmployee: new UpdateEmployeeController(updateEmployee)
    }
  };
}

export type Container = ReturnType<typeof createContainer>;
