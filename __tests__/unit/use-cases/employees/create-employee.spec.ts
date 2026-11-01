import { CreateEmployeeUseCase } from "@/application/use-cases/employees";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryEmployeeRepository();
  const sut = new CreateEmployeeUseCase(repo);

  return { sut, repo };
};

describe("CreateEmployeeUseCase", () => {
  it("creates employee and returns it on success", async () => {
    // Arrange
    const { sut, repo } = makeSut();

    // Act
    const result = await sut.execute({
      name: "John Doe",
      email: "john@example.com"
    });

    // Assert
    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.employee.name).toBe("John Doe");
      expect(result.value.employee.email).toBe("john@example.com");
    }

    expect(repo.employees).toHaveLength(1);
  });

  it("returns ValidationError when email is invalid", async () => {
    // Arrange
    const { sut } = makeSut();

    // Act
    const result = await sut.execute({ name: "John", email: "not-an-email" });

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ValidationError);
  });

  it("returns ConflictError when email already exists", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    await repo.create(
      Employee.create({ name: "Jane", email: "john@example.com" })
    );

    // Act
    const result = await sut.execute({
      name: "John",
      email: "john@example.com"
    });

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ConflictError);
  });

  it("returns InternalError when repository throws", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    repo.forceError = true;

    // Act
    const result = await sut.execute({
      name: "John",
      email: "john@example.com"
    });

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalError);
  });
});
