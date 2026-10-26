import {
  CreateUserUseCase,
  GetUserByIdUseCase
} from "@/application/use-cases/users";
import type { UserRepository } from "@/domain/repositories";
import { CreateUserController } from "./controllers/user/create-user.controller";
import { GetUserByIdController } from "./controllers/user/get-user-by-id.controller";
import {
  HealthController,
  type DatabaseCheck
} from "./health/health.controller";

export interface ContainerDeps {
  userRepository: UserRepository;
  checkDatabase: DatabaseCheck;
}

export function createContainer({
  userRepository,
  checkDatabase
}: ContainerDeps) {
  const createUser = new CreateUserUseCase(userRepository);
  const getUserById = new GetUserByIdUseCase(userRepository);

  return {
    health: new HealthController(checkDatabase),
    user: {
      createUser: new CreateUserController(createUser),
      getUserById: new GetUserByIdController(getUserById)
    }
  };
}

export type Container = ReturnType<typeof createContainer>;
