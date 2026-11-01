import { UniqueEntityId } from "@/core/entities";
import { Employee } from "@/domain/entities";
import { ClosingPeriodicity } from "@/domain/enums";
import type { Prisma, Employee as PrismaEmployee } from "@prisma/client";

export class PrismaEmployeeMapper {
  static toDomain(raw: PrismaEmployee): Employee {
    return Employee.create(
      {
        name: raw.name,
        closingPeriodicity: ClosingPeriodicity[raw.closingPeriodicity],
        hireDate: raw.hireDate,
        workdayEndTime: raw.workdayEndTime,
        workdayStartTime: raw.workdayStartTime,
        terminationDate: raw.terminationDate ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPrisma(employee: Employee): Prisma.EmployeeUncheckedCreateInput {
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
