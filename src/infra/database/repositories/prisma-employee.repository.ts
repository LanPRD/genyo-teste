import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { PrismaEmployeeMapper } from "../mappers";
import type { PrismaService } from "../prisma/prisma.service";

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}
  delete(_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  list(): Promise<Employee[]> {
    throw new Error("Method not implemented.");
  }

  update(_employee: Employee): Promise<Employee> {
    throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null }
    });

    if (!employee) return null;

    return PrismaEmployeeMapper.toDomain(employee);
  }

  async create(employee: Employee): Promise<Employee> {
    const entity = await this.prisma.employee.create({
      data: PrismaEmployeeMapper.toPrisma(employee)
    });

    return PrismaEmployeeMapper.toDomain(entity);
  }
}
