import type { UpdateEmployeeDto } from "@/application/dtos";
import { UpdateEmployeeUseCase } from "@/application/use-cases/employees";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { ClosingPeriodicity } from "@/domain/enums";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

function makeEmployee() {
  return Employee.create({
    name: "John Doe",
    hireDate: new Date("2026-01-10"),
    terminationDate: new Date("2026-12-31"),
    workdayStartTime: "08:00",
    workdayEndTime: "17:00",
    closingPeriodicity: ClosingPeriodicity.MONTHLY
  });
}

function makeInput(overrides: Partial<UpdateEmployeeDto> = {}) {
  return {
    name: "Maria da Silva",
    hireDate: "2025-03-01",
    workdayStartTime: "09:00",
    workdayEndTime: "18:00",
    closingPeriodicity: ClosingPeriodicity.ANNUAL,
    ...overrides
  };
}

describe("UpdateEmployeeUseCase", () => {
  let repo: InMemoryEmployeeRepository;
  let sut: UpdateEmployeeUseCase;

  beforeAll(() => {
    repo = new InMemoryEmployeeRepository();
    sut = new UpdateEmployeeUseCase(repo);
  });

  afterEach(() => {
    repo.forceError = false;
  });

  it("replaces the employee data and keeps its id and creation date", async () => {
    // Arrange
    const existing = await repo.create(makeEmployee());
    const input = makeInput({ terminationDate: "2026-06-30" });

    // Act
    const result = await sut.execute(existing.id.toString(), input);

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { employee } = result.value;

      expect(employee.id.equals(existing.id)).toBe(true);
      expect(employee.createdAt).toEqual(existing.createdAt);
      expect(employee.name).toBe("Maria da Silva");
      expect(employee.hireDate).toEqual(new Date("2025-03-01"));
      expect(employee.terminationDate).toEqual(new Date("2026-06-30"));
      expect(employee.workdayStartTime).toBe("09:00");
      expect(employee.workdayEndTime).toBe("18:00");
      expect(employee.closingPeriodicity).toBe(ClosingPeriodicity.ANNUAL);
    }

    expect(await repo.findById(existing.id.toString())).toMatchObject({
      name: "Maria da Silva"
    });
  });

  it("turns the employee active again when terminationDate is omitted", async () => {
    // Arrange
    const existing = await repo.create(makeEmployee());

    // Act
    const result = await sut.execute(existing.id.toString(), makeInput());

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.employee.terminationDate).toBeUndefined();
    }
  });

  it("returns NotFoundError when the employee does not exist", async () => {
    // Act
    const result = await sut.execute("missing-id", makeInput());

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(result.value).toMatchObject({ errorType: "EMPLOYEE_NOT_FOUND" });
  });

  it.each<[string, Partial<UpdateEmployeeDto>]>([
    ["name contains numbers", { name: "Maria 2" }],
    [
      "terminationDate is before hireDate",
      { hireDate: "2026-06-01", terminationDate: "2026-05-31" }
    ],
    [
      "workdayEndTime is before workdayStartTime",
      { workdayStartTime: "17:00", workdayEndTime: "08:00" }
    ],
    [
      "closingPeriodicity is not an accepted value",
      { closingPeriodicity: "BIENNIAL" as ClosingPeriodicity }
    ]
  ])(
    "returns ValidationError and keeps the stored data when %s",
    async (_scenario, overrides) => {
      // Arrange
      const existing = await repo.create(makeEmployee());

      // Act
      const result = await sut.execute(
        existing.id.toString(),
        makeInput(overrides)
      );

      // Assert
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(ValidationError);
      expect(await repo.findById(existing.id.toString())).toMatchObject({
        name: "John Doe"
      });
    }
  );

  it("returns InternalError when repository throws", async () => {
    // Arrange
    const existing = await repo.create(makeEmployee());
    repo.forceError = true;

    // Act
    const result = await sut.execute(existing.id.toString(), makeInput());

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalError);
  });
});
