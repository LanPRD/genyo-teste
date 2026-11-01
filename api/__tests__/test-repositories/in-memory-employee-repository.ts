import type { Employee } from "@/domain/entities";
import {
  EmployeeRepository,
  type ListEmployeesParams,
  type ListEmployeesResult
} from "@/domain/repositories";

export class InMemoryEmployeeRepository extends EmployeeRepository {
  employees: Employee[] = [];
  forceError = false;

  async delete(id: string): Promise<void> {
    if (this.forceError) throw new Error("Forced error");

    this.employees = this.employees.filter(u => u.id.toString() !== id);

    return Promise.resolve();
  }

  async list({
    limit,
    cursor
  }: ListEmployeesParams): Promise<ListEmployeesResult> {
    if (this.forceError) throw new Error("Forced error");

    const sorted = [...this.employees].sort(
      (a, b) =>
        a.hireDate.getTime() - b.hireDate.getTime() ||
        a.id.toString().localeCompare(b.id.toString())
    );

    // Como o Prisma, um cursor que não existe resulta em página vazia.
    const cursorIndex =
      cursor ? sorted.findIndex(e => e.id.toString() === cursor) : -1;
    const start = cursorIndex + 1;
    const rows =
      cursor && cursorIndex === -1 ?
        []
      : sorted.slice(start, start + limit + 1);
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      employees: page,
      nextCursor: hasMore ? (page.at(-1)?.id.toString() ?? null) : null
    };
  }

  async update(employee: Employee): Promise<Employee> {
    if (this.forceError) throw new Error("Forced error");

    const index = this.employees.findIndex(e => e.id.equals(employee.id));

    if (index === -1) throw new Error("Employee not found");

    this.employees[index] = employee;

    return employee;
  }

  async findById(id: string): Promise<Employee | null> {
    if (this.forceError) throw new Error("Forced error");

    return Promise.resolve(
      this.employees.find(u => u.id.toString() === id) ?? null
    );
  }

  async create(employee: Employee): Promise<Employee> {
    if (this.forceError) throw new Error("Forced error");

    this.employees.push(employee);

    return Promise.resolve(employee);
  }
}
