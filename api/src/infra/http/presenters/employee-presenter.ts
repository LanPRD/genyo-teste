import type { Employee } from "@/domain/entities";

export class EmployeePresenter {
  static toHTTP(employee: Employee) {
    return {
      id: employee.id.toString(),
      name: employee.name,
      closingPeriodicity: employee.closingPeriodicity,
      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate ?? null,
      workdayStartTime: employee.workdayStartTime,
      workdayEndTime: employee.workdayEndTime,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }
}
