import { randomUUID } from "node:crypto";

export class UniqueEntityId {
  private _value: string;

  constructor(value?: string) {
    this._value = value ?? randomUUID();
  }

  toString(): string {
    return this._value;
  }

  equals(id: UniqueEntityId): boolean {
    return this._value === id.toString();
  }
}
