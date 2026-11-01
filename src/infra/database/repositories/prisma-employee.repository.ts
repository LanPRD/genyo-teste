import type { Employee } from "@/domain/entities";
import {
  EmployeeRepository,
  type ListEmployeesParams,
  type ListEmployeesResult
} from "@/domain/repositories";
import { PrismaEmployeeMapper } from "../mappers";
import type { PrismaService } from "../prisma/prisma.service";

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}
  async delete(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: { id: id }
    });
  }

  async list({
    limit,
    cursor
  }: ListEmployeesParams): Promise<ListEmployeesResult> {
    // Busca uma linha a mais para saber se existe próxima página.
    const rows = await this.prisma.employee.findMany({
      orderBy: [{ hireDate: "asc" }, { id: "asc" }],
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      employees: page.map(entity => PrismaEmployeeMapper.toDomain(entity)),
      nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null
    };
  }

  async update(employee: Employee): Promise<Employee> {
    const entity = await this.prisma.employee.update({
      where: { id: employee.id.toString() },
      data: PrismaEmployeeMapper.toPrismaUpdate(employee)
    });

    return PrismaEmployeeMapper.toDomain(entity);
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
