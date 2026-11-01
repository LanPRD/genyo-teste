import { ListEmployeesUseCase } from "@/application/use-cases/employees";
import { InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { ClosingPeriodicity } from "@/domain/enums";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

async function seed(repo: InMemoryEmployeeRepository, hireDates: string[]) {
  for (const hireDate of hireDates) {
    await repo.create(
      Employee.create({
        name: `Employee ${hireDate}`,
        hireDate: new Date(hireDate),
        workdayStartTime: "08:00",
        workdayEndTime: "17:00",
        closingPeriodicity: ClosingPeriodicity.MONTHLY
      })
    );
  }
}

describe("ListEmployeesUseCase", () => {
  let repo: InMemoryEmployeeRepository;
  let sut: ListEmployeesUseCase;

  beforeEach(() => {
    repo = new InMemoryEmployeeRepository();
    sut = new ListEmployeesUseCase(repo);
  });

  it("returns the first page ordered by hire date with a next cursor", async () => {
    // Arrange
    await seed(repo, ["2024-03-01", "2022-01-01", "2023-02-01"]);

    // Act
    const result = await sut.execute({ limit: 2 });

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { employees, limit, nextCursor } = result.value;

      expect(employees.map(e => e.hireDate.getUTCFullYear())).toEqual([
        2022, 2023
      ]);
      expect(limit).toBe(2);
      expect(nextCursor).toBe(employees[1].id.toString());
    }
  });

  it("returns the next page from the cursor and no cursor on the last page", async () => {
    // Arrange
    await seed(repo, ["2022-01-01", "2023-02-01", "2024-03-01"]);
    const first = await sut.execute({ limit: 2 });
    const cursor = first.isRight() ? first.value.nextCursor! : "";

    // Act
    const result = await sut.execute({ limit: 2, cursor });

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(
        result.value.employees.map(e => e.hireDate.getUTCFullYear())
      ).toEqual([2024]);
      expect(result.value.nextCursor).toBeNull();
    }
  });

  it("returns no cursor when the last page is exactly full", async () => {
    // Arrange
    await seed(repo, ["2022-01-01", "2023-02-01"]);

    // Act
    const result = await sut.execute({ limit: 2 });

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.employees).toHaveLength(2);
      expect(result.value.nextCursor).toBeNull();
    }
  });

  it("returns an empty page when the cursor does not exist", async () => {
    // Arrange
    await seed(repo, ["2022-01-01"]);

    // Act
    const result = await sut.execute({ cursor: "missing-id" });

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.employees).toEqual([]);
      expect(result.value.nextCursor).toBeNull();
    }
  });

  it("uses a default limit of 10 and accepts the limit as text", async () => {
    // Act
    const withDefault = await sut.execute({});
    const fromQuery = await sut.execute({ limit: "5" });

    // Assert
    expect(withDefault.isRight() && withDefault.value.limit).toBe(10);
    expect(fromQuery.isRight() && fromQuery.value.limit).toBe(5);
  });

  it.each([0, 101, "abc"])(
    "returns ValidationError when limit is %s",
    async limit => {
      // Act
      const result = await sut.execute({ limit });

      // Assert
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(ValidationError);
    }
  );

  it("returns InternalError when repository throws", async () => {
    // Arrange
    repo.forceError = true;

    // Act
    const result = await sut.execute({});

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalError);
  });
});
