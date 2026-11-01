import type { CreateEmployeeDto } from "@/application/dtos";
import {
  CreateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetEmployeeByIdUseCase
} from "@/application/use-cases/employees";
import { NotFoundError, ValidationError } from "@/core/errors";
import { ClosingPeriodicity } from "@/domain/enums";
import { prisma } from "@/infra/database/prisma/prisma.service";
import { PrismaEmployeeRepository } from "@/infra/database/repositories";

const repository = new PrismaEmployeeRepository(prisma);

const input: CreateEmployeeDto = {
  name: "Maria da Silva",
  hireDate: "2026-01-10",
  workdayStartTime: "08:00",
  workdayEndTime: "17:00",
  closingPeriodicity: ClosingPeriodicity.MONTHLY
};

describe("Employee use cases (integration)", () => {
  beforeEach(async () => {
    await prisma.employee.deleteMany();
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  describe("CreateEmployeeUseCase", () => {
    it("persists an employee with a termination date", async () => {
      // Arrange
      const sut = new CreateEmployeeUseCase(repository);

      // Act
      const result = await sut.execute({
        ...input,
        terminationDate: "2026-12-31"
      });

      // Assert
      expect(result.isRight()).toBe(true);
      expect(await prisma.employee.findFirstOrThrow()).toMatchObject({
        name: "Maria da Silva",
        hireDate: new Date("2026-01-10"),
        terminationDate: new Date("2026-12-31"),
        workdayStartTime: "08:00",
        workdayEndTime: "17:00",
        closingPeriodicity: "MONTHLY"
      });
    });

    it("persists an active employee without a termination date", async () => {
      // Arrange
      const sut = new CreateEmployeeUseCase(repository);

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);
      expect((await prisma.employee.findFirstOrThrow()).terminationDate).toBe(
        null
      );
    });

    it("persists nothing when the input is invalid", async () => {
      // Arrange
      const sut = new CreateEmployeeUseCase(repository);

      // Act
      const result = await sut.execute({ ...input, name: "Maria 2" });

      // Assert
      expect(result.value).toBeInstanceOf(ValidationError);
      expect(await prisma.employee.count()).toBe(0);
    });
  });

  describe("GetEmployeeByIdUseCase", () => {
    it("returns the persisted employee as a domain entity", async () => {
      // Arrange
      const created = await new CreateEmployeeUseCase(repository).execute({
        ...input,
        terminationDate: "2026-12-31"
      });
      const id = created.isRight() ? created.value.employee.id.toString() : "";
      const sut = new GetEmployeeByIdUseCase(repository);

      // Act
      const result = await sut.execute(id);

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const { employee } = result.value;

        expect(employee.name).toBe("Maria da Silva");
        expect(employee.hireDate).toEqual(new Date("2026-01-10"));
        expect(employee.terminationDate).toEqual(new Date("2026-12-31"));
        expect(employee.closingPeriodicity).toBe("MONTHLY");
      }
    });

    it("returns NotFoundError when the employee does not exist", async () => {
      // Arrange
      const sut = new GetEmployeeByIdUseCase(repository);

      // Act
      const result = await sut.execute("missing-id");

      // Assert
      expect(result.value).toBeInstanceOf(NotFoundError);
    });
  });

  describe("DeleteEmployeeUseCase", () => {
    it("removes the employee from the database", async () => {
      // Arrange
      const created = await new CreateEmployeeUseCase(repository).execute(
        input
      );
      const id = created.isRight() ? created.value.employee.id.toString() : "";
      const sut = new DeleteEmployeeUseCase(repository);

      // Act
      const result = await sut.execute(id);

      // Assert
      expect(result.isRight()).toBe(true);
      expect(await prisma.employee.count()).toBe(0);
    });

    it("returns NotFoundError and keeps the other employees", async () => {
      // Arrange
      await new CreateEmployeeUseCase(repository).execute(input);
      const sut = new DeleteEmployeeUseCase(repository);

      // Act
      const result = await sut.execute("missing-id");

      // Assert
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(await prisma.employee.count()).toBe(1);
    });
  });
});
