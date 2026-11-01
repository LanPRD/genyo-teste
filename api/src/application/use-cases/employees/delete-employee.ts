import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError } from "@/core/errors";
import { EmployeeRepository } from "@/domain/repositories";

type DeleteEmployeeUseCaseResponse = Either<
  InternalError | NotFoundError,
  void
>;

export class DeleteEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(id: string): Promise<DeleteEmployeeUseCaseResponse> {
    try {
      const employee = await this.employeeRepository.findById(id);

      if (!employee) {
        return left(new NotFoundError("Employee", id));
      }

      await this.employeeRepository.delete(id);
      return right(undefined);
    } catch (error) {
      console.error("Error deleting employee", error);
      return left(new InternalError("Error deleting employee"));
    }
  }
}
