import type { Employee } from "../entities";

export abstract class EmployeeRepository {
  abstract findById(id: string): Promise<Employee | null>;
  abstract findByEmail(email: string): Promise<Employee | null>;
  abstract create(employee: Employee): Promise<Employee>;
}
