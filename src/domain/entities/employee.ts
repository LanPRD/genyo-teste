import { Entity, UniqueEntityId } from "@/core/entities";
import type { Optional } from "@/core/types/optional";
import type { ClosingPeriodicity } from "../enums";

export interface EmployeeProps {
  name: string;
  hireDate: Date;
  terminationDate?: Date;
  workdayStartTime: string;
  workdayEndTime: string;
  closingPeriodicity: ClosingPeriodicity;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Employee extends Entity<EmployeeProps> {
  get name(): string {
    return this.props.name;
  }

  get hireDate(): Date {
    return this.props.hireDate;
  }

  get terminationDate(): Date | undefined {
    return this.props.terminationDate;
  }

  get workdayStartTime(): string {
    return this.props.workdayStartTime;
  }

  get workdayEndTime(): string {
    return this.props.workdayEndTime;
  }

  get closingPeriodicity(): ClosingPeriodicity {
    return this.props.closingPeriodicity;
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
    props: Optional<EmployeeProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UniqueEntityId
  ): Employee {
    return new Employee(
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
