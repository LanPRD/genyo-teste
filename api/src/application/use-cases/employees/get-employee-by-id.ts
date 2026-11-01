import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError } from "@/core/errors";
import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

type GetEmployeeByIdUseCaseResponse = Either<
  NotFoundError | InternalError,
  { employee: Employee }
>;

export class GetEmployeeByIdUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(id: string): Promise<GetEmployeeByIdUseCaseResponse> {
    try {
      const employee = await this.employeeRepository.findById(id);

      if (!employee) {
        return left(new NotFoundError("Employee", id));
      }

      return right({ employee });
    } catch (error) {
      console.error("Error getting employee", error);
      return left(new InternalError("Error getting employee"));
    }
  }
}
