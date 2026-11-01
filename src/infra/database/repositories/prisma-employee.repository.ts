import { ConflictError } from "@/core/errors";
import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { Prisma } from "@prisma/client";
import { PrismaEmployeeMapper } from "../mappers";
import type { PrismaService } from "../prisma/prisma.service";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null }
    });

    if (!employee) return null;

    return PrismaEmployeeMapper.toDomain(employee);
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { email, deletedAt: null }
    });

    if (!employee) return null;

    return PrismaEmployeeMapper.toDomain(employee);
  }

  async create(employee: Employee): Promise<Employee> {
    try {
      const entity = await this.prisma.employee.create({
        data: PrismaEmployeeMapper.toPrisma(employee)
      });

      return PrismaEmployeeMapper.toDomain(entity);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictError("Employee with this email already exists");
      }

      throw error;
    }
  }
}
