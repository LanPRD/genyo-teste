import { UniqueEntityId } from "@/core/entities";
import { User } from "@/domain/entities";
import type { Prisma, User as PrismaUser } from "@prisma/client";

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt
    };
  }
}
