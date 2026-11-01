import {
  CreateEmployeeSchema,
  type CreateEmployeeDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

type CreateEmployeeUseCaseResponse = Either<
  ConflictError | ValidationError | InternalError,
  { employee: Employee }
>;

export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    input: CreateEmployeeDto
  ): Promise<CreateEmployeeUseCaseResponse> {
    try {
      const parsed = CreateEmployeeSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid employee data", parsed.error));
      }

      const { hireDate, terminationDate, ...rest } = parsed.data;

      const employeeCreated = await this.employeeRepository.create(
        Employee.create({
          ...rest,
          hireDate: new Date(hireDate),
          terminationDate:
            terminationDate ? new Date(terminationDate) : undefined
        })
      );

      return right({ employee: employeeCreated });
    } catch (error) {
      console.error("Error creating employee", error);
      return left(new InternalError("Error creating employee"));
    }
  }
}
