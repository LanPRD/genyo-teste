import type { Employee } from "@/domain/entities";

export class EmployeePresenter {
  static toHTTP(employee: Employee) {
    return {
      id: employee.id.toString(),
      name: employee.name,
      email: employee.email,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      deletedAt: employee.deletedAt
    };
  }
}
