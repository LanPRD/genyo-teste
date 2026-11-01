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
        return left(new ValidationError("Invalid employee data"));
      }

      const { name, email } = parsed.data;

      const existing = await this.employeeRepository.findByEmail(email);

      if (existing) {
        return left(
          new ConflictError("Employee with this email already exists")
        );
      }

      const employee = await this.employeeRepository.create(
        Employee.create({ name, email })
      );

      return right({ employee });
    } catch (error) {
      if (error instanceof ConflictError) {
        return left(error);
      }

      console.error("Error creating employee", error);
      return left(new InternalError("Error creating employee"));
    }
  }
}
