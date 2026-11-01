import { ConflictError } from "@/core/errors";
import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

export class InMemoryEmployeeRepository extends EmployeeRepository {
  employees: Employee[] = [];
  forceError = false;

  async findById(id: string): Promise<Employee | null> {
    if (this.forceError) throw new Error("Forced error");

    return this.employees.find(u => u.id.toString() === id) ?? null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    if (this.forceError) throw new Error("Forced error");

    return this.employees.find(u => u.email === email) ?? null;
  }

  async create(employee: Employee): Promise<Employee> {
    if (this.forceError) throw new Error("Forced error");

    if (this.employees.some(u => u.email === employee.email)) {
      throw new ConflictError("Employee with this email already exists");
    }

    this.employees.push(employee);
    return employee;
  }
}
