import { GetEmployeeByIdUseCase } from "@/application/use-cases/employees";
import { InternalError, NotFoundError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryEmployeeRepository();
  const sut = new GetEmployeeByIdUseCase(repo);

  return { sut, repo };
};

describe("GetEmployeeByIdUseCase", () => {
  it("returns the employee when it exists", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    const employee = await repo.create(Employee.create({} as any));

    // Act
    const result = await sut.execute(employee.id.toString());

    // Assert
    expect(result.isRight()).toBe(true);
  });

  it("returns NotFoundError when employee does not exist", async () => {
    // Arrange
    const { sut } = makeSut();

    // Act
    const result = await sut.execute("missing-id");

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
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
