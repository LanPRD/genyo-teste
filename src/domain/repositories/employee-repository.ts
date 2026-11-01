import type { Employee } from "../entities";

export interface ListEmployeesParams {
  limit: number;
  cursor?: string;
}

export interface ListEmployeesResult {
  employees: Employee[];
  nextCursor: string | null;
}

export abstract class EmployeeRepository {
  abstract findById(id: string): Promise<Employee | null>;
  abstract create(employee: Employee): Promise<Employee>;
  abstract delete(id: string): Promise<void>;
  abstract list(params: ListEmployeesParams): Promise<ListEmployeesResult>;
  abstract update(employee: Employee): Promise<Employee>;
}
