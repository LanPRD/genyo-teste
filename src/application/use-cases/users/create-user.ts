import { CreateUserSchema, type CreateUserDto } from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { User } from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";

type CreateUserUseCaseResponse = Either<
  ConflictError | ValidationError | InternalError,
  { user: User }
>;

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserDto): Promise<CreateUserUseCaseResponse> {
    try {
      const parsed = CreateUserSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid user data"));
      }

      const { name, email } = parsed.data;

      const existing = await this.userRepository.findByEmail(email);

      if (existing) {
        return left(new ConflictError("User with this email already exists"));
      }

      const user = await this.userRepository.create(
        User.create({ name, email })
      );

      return right({ user });
    } catch (error) {
      if (error instanceof ConflictError) {
        return left(error);
      }

      console.error("Error creating user", error);
      return left(new InternalError("Error creating user"));
    }
  }
}
