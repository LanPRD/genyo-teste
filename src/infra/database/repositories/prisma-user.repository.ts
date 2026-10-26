import { ConflictError } from "@/core/errors";
import type { User } from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";
import { Prisma } from "@prisma/client";
import { PrismaUserMapper } from "../mappers";
import type { PrismaService } from "../prisma/prisma.service";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null }
    });

    if (!user) return null;

    return PrismaUserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (!user) return null;

    return PrismaUserMapper.toDomain(user);
  }

  async create(user: User): Promise<User> {
    try {
      const entity = await this.prisma.user.create({
        data: PrismaUserMapper.toPrisma(user)
      });

      return PrismaUserMapper.toDomain(entity);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictError("User with this email already exists");
      }

      throw error;
    }
  }
}
