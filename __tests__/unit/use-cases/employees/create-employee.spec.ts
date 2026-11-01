import type { CreateEmployeeDto } from "@/application/dtos";
import { CreateEmployeeUseCase } from "@/application/use-cases/employees";
import { InternalError, ValidationError } from "@/core/errors";
import { ClosingPeriodicity } from "@/domain/enums";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(console, "error").mockImplementation(() => {});

const makeInput = (
  overrides: Partial<CreateEmployeeDto> = {}
): CreateEmployeeDto => ({
  name: "John Doe",
  hireDate: "2026-01-10",
  workdayStartTime: "08:00",
  workdayEndTime: "17:00",
  closingPeriodicity: ClosingPeriodicity.MONTHLY,
  ...overrides
});

describe("CreateEmployeeUseCase", () => {
  let repo: InMemoryEmployeeRepository;
  let sut: CreateEmployeeUseCase;

  beforeEach(() => {
    repo = new InMemoryEmployeeRepository();
    sut = new CreateEmployeeUseCase(repo);
  });

  describe("success", () => {
    it("creates employee and returns it on success", async () => {
      // Arrange
      const input = makeInput({ terminationDate: "2026-12-31" });

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const { employee } = result.value;

        expect(employee.name).toBe(input.name);
        expect(employee.hireDate).toEqual(new Date(input.hireDate));
        expect(employee.terminationDate).toEqual(new Date("2026-12-31"));
        expect(employee.workdayStartTime).toBe(input.workdayStartTime);
        expect(employee.workdayEndTime).toBe(input.workdayEndTime);
        expect(employee.closingPeriodicity).toBe(input.closingPeriodicity);
      }

      expect(repo.employees).toHaveLength(1);
    });

    it("creates an active employee when terminationDate is omitted", async () => {
      // Arrange
      const input = makeInput();

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.employee.terminationDate).toBeUndefined();
      }

      expect(repo.employees).toHaveLength(1);
    });

    it("accepts terminationDate equal to hireDate", async () => {
      // Arrange
      const sameDay = "2026-01-10";
      const input = makeInput({ hireDate: sameDay, terminationDate: sameDay });

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);
    });

    it("accepts workdayEndTime equal to workdayStartTime", async () => {
      // Arrange
      const input = makeInput({
        workdayStartTime: "08:00",
        workdayEndTime: "08:00"
      });

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);
    });
  });

  describe("validation", () => {
    it.each<[string, Partial<CreateEmployeeDto>]>([
      ["name is missing", { name: undefined }],
      ["name is empty", { name: "" }],
      ["name contains numbers", { name: "John 2" }],
      ["hireDate is missing", { hireDate: undefined }],
      [
        "terminationDate is before hireDate",
        {
          hireDate: "2026-06-01",
          terminationDate: "2026-05-31"
        }
      ],
      ["workdayStartTime is missing", { workdayStartTime: undefined }],
      ["workdayStartTime is not HH:mm", { workdayStartTime: "8:00" }],
      ["workdayEndTime is missing", { workdayEndTime: undefined }],
      ["workdayEndTime is not HH:mm", { workdayEndTime: "17h00" }],
      [
        "workdayEndTime is before workdayStartTime",
        { workdayStartTime: "17:00", workdayEndTime: "08:00" }
      ],
      ["closingPeriodicity is missing", { closingPeriodicity: undefined }],
      [
        "closingPeriodicity is not an accepted value",
        { closingPeriodicity: "BIENNIAL" as ClosingPeriodicity }
      ]
    ])("returns ValidationError when %s", async (_scenario, overrides) => {
      // Arrange
      const input = makeInput(overrides);

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(ValidationError);
      expect(repo.employees).toHaveLength(0);
    });
  });

  describe("unexpected error", () => {
    it("returns InternalError when repository throws", async () => {
      // Arrange
      repo.forceError = true;

      // Act
      const result = await sut.execute(makeInput());

      // Assert
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InternalError);
    });
  });
});
