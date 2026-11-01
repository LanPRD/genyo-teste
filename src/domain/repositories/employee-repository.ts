import type { Employee } from "../entities";

export abstract class EmployeeRepository {
  abstract findById(id: string): Promise<Employee | null>;
  abstract create(employee: Employee): Promise<Employee>;
  abstract delete(id: string): Promise<void>;
  abstract list(): Promise<Employee[]>;
  abstract update(employee: Employee): Promise<Employee>;
}
