import { ConflictError } from "@/core/errors";
import type { User } from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";

export class InMemoryUserRepository extends UserRepository {
  users: User[] = [];
  forceError = false;

  async findById(id: string): Promise<User | null> {
    if (this.forceError) throw new Error("Forced error");

    return this.users.find(u => u.id.toString() === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (this.forceError) throw new Error("Forced error");

    return this.users.find(u => u.email === email) ?? null;
  }

  async create(user: User): Promise<User> {
    if (this.forceError) throw new Error("Forced error");

    if (this.users.some(u => u.email === user.email)) {
      throw new ConflictError("User with this email already exists");
    }

    this.users.push(user);
    return user;
  }
}
