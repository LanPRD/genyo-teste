import { Entity, UniqueEntityId } from "@/core/entities";
import type { Optional } from "@/core/types/optional";

export interface UserProps {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User extends Entity<UserProps> {
  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<UserProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UniqueEntityId
  ): User {
    return new User(
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...props
      },
      id
    );
  }
}
