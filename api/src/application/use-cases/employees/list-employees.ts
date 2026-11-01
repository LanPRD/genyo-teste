import { ListEmployeesSchema, type ListEmployeesDto } from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

type ListEmployeesUseCaseResponse = Either<
  ValidationError | InternalError,
  { employees: Employee[]; limit: number; nextCursor: string | null }
>;

export class ListEmployeesUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    input: ListEmployeesDto
  ): Promise<ListEmployeesUseCaseResponse> {
    try {
      const parsed = ListEmployeesSchema.safeParse(input);

      if (!parsed.success) {
        return left(
          new ValidationError("Invalid pagination params", parsed.error)
        );
      }

      const { limit, cursor } = parsed.data;
      const { employees, nextCursor } = await this.employeeRepository.list({
        limit,
        cursor
      });

      return right({ employees, limit, nextCursor });
    } catch (error) {
      console.error("Error listing employees", error);
      return left(new InternalError("Error listing employees"));
    }
  }
}
