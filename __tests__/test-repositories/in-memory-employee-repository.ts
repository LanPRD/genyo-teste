import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

export class InMemoryEmployeeRepository extends EmployeeRepository {
  employees: Employee[] = [];
  forceError = false;

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  list(): Promise<Employee[]> {
    throw new Error("Method not implemented.");
  }

  update(employee: Employee): Promise<Employee> {
    throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Employee | null> {
    if (this.forceError) throw new Error("Forced error");

    return this.employees.find(u => u.id.toString() === id) ?? null;
  }

  async create(employee: Employee): Promise<Employee> {
    if (this.forceError) throw new Error("Forced error");

    this.employees.push(employee);
    return employee;
  }
}
