import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { PrismaEmployeeMapper } from "../mappers";
import type { PrismaService } from "../prisma/prisma.service";

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}
  async delete(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: { id: id }
    });
  }

  async list(): Promise<Employee[]> {
    const employees = await this.prisma.employee.findMany({
      orderBy: { hireDate: "asc" }
    });

    return employees.map(entity => PrismaEmployeeMapper.toDomain(entity));
  }

  update(_employee: Employee): Promise<Employee> {
    throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { id }
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
