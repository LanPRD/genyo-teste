import { UniqueEntityId } from "@/core/entities";
import { Employee } from "@/domain/entities";
import type { Prisma, Employee as PrismaEmployee } from "@prisma/client";

export class PrismaEmployeeMapper {
  static toDomain(raw: PrismaEmployee): Employee {
    return Employee.create(
      {
        name: raw.name,
        email: raw.email,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPrisma(employee: Employee): Prisma.EmployeeUncheckedCreateInput {
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
