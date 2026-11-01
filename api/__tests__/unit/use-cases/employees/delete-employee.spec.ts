import { DeleteEmployeeUseCase } from "@/application/use-cases/employees";
import { InternalError, NotFoundError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { ClosingPeriodicity } from "@/domain/enums";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

function makeSut() {
  const repo = new InMemoryEmployeeRepository();
  const sut = new DeleteEmployeeUseCase(repo);

  return { sut, repo };
}

function makeEmployee() {
  return Employee.create({
    name: "John Doe",
    hireDate: new Date("2026-01-10"),
    workdayStartTime: "08:00",
    workdayEndTime: "17:00",
    closingPeriodicity: ClosingPeriodicity.MONTHLY
  });
}

describe("DeleteEmployeeUseCase", () => {
  let repo: InMemoryEmployeeRepository;
  let sut: DeleteEmployeeUseCase;

  beforeEach(() => {
    repo = new InMemoryEmployeeRepository();
    sut = new DeleteEmployeeUseCase(repo);
  });

  it("deletes the employee when it exists", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    const employee = await repo.create(makeEmployee());

    // Act
    const result = await sut.execute(employee.id.toString());

    // Assert
    expect(result.isRight()).toBe(true);
    expect(repo.employees).toHaveLength(0);
  });

  it("returns NotFoundError when employee does not exist", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    await repo.create(makeEmployee());

    // Act
    const result = await sut.execute("missing-id");

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(result.value).toMatchObject({
      errorType: "EMPLOYEE_NOT_FOUND",
      message: "Employee with id missing-id not found"
    });
    expect(repo.employees).toHaveLength(1);
  });

  it("returns InternalError when repository throws", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    repo.forceError = true;

    // Act
    const result = await sut.execute("any-id");

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalError);
  });
});
