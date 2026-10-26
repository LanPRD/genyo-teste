import { GetUserByIdUseCase } from "@/application/use-cases/users";
import { InternalError, NotFoundError } from "@/core/errors";
import { User } from "@/domain/entities";
import { InMemoryUserRepository } from "../../../test-repositories/in-memory-user-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryUserRepository();
  const sut = new GetUserByIdUseCase(repo);

  return { sut, repo };
};

describe("GetUserByIdUseCase", () => {
  it("returns the user when it exists", async () => {
    // Arrange
    const { sut, repo } = makeSut();
    const user = await repo.create(
      User.create({ name: "John", email: "john@example.com" })
    );

    // Act
    const result = await sut.execute(user.id.toString());

    // Assert
    expect(result.isRight()).toBe(true);
  });

  it("returns NotFoundError when user does not exist", async () => {
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
