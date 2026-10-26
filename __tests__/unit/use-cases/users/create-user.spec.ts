import { CreateUserUseCase } from "@/application/use-cases/users";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { User } from "@/domain/entities";
import { InMemoryUserRepository } from "../../../test-repositories/in-memory-user-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryUserRepository();
  const sut = new CreateUserUseCase(repo);

  return { sut, repo };
};

describe("CreateUserUseCase", () => {
  it("creates user and returns it on success", async () => {
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
      expect(result.value.user.name).toBe("John Doe");
      expect(result.value.user.email).toBe("john@example.com");
    }

    expect(repo.users).toHaveLength(1);
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
    await repo.create(User.create({ name: "Jane", email: "john@example.com" }));

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
