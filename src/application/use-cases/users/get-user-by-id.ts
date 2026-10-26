import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError } from "@/core/errors";
import type { User } from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";

type GetUserByIdUseCaseResponse = Either<
  NotFoundError | InternalError,
  { user: User }
>;

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<GetUserByIdUseCaseResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return left(new NotFoundError("User", id));
      }

      return right({ user });
    } catch (error) {
      console.error("Error getting user", error);
      return left(new InternalError("Error getting user"));
    }
  }
}
