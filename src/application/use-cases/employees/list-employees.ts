import { left, right, type Either } from "@/core/either";
import { InternalError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

type ListEmployeesUseCaseResponse = Either<
  InternalError,
  { employees: Employee[] }
>;

export class ListEmployeesUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(): Promise<ListEmployeesUseCaseResponse> {
    try {
      const employees = await this.employeeRepository.list();

      return right({ employees: employees });
    } catch (error) {
      console.error("Error listing employees", error);
      return left(new InternalError("Error listing employees"));
    }
  }
}
