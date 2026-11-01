import {
  UpdateEmployeeSchema,
  type UpdateEmployeeDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

type UpdateEmployeeUseCaseResponse = Either<
  NotFoundError | ValidationError | InternalError,
  { employee: Employee }
>;

export class UpdateEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    id: string,
    input: UpdateEmployeeDto
  ): Promise<UpdateEmployeeUseCaseResponse> {
    try {
      const parsed = UpdateEmployeeSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid employee data", parsed.error));
      }

      const current = await this.employeeRepository.findById(id);

      if (!current) {
        return left(new NotFoundError("Employee", id));
      }

      const { hireDate, terminationDate, ...rest } = parsed.data;

      const employee = await this.employeeRepository.update(
        Employee.create(
          {
            ...rest,
            hireDate: new Date(hireDate),
            terminationDate:
              terminationDate ? new Date(terminationDate) : undefined,
            createdAt: current.createdAt,
            updatedAt: new Date()
          },
          current.id
        )
      );

      return right({ employee });
    } catch (error) {
      console.error("Error updating employee", error);
      return left(new InternalError("Error updating employee"));
    }
  }
}
