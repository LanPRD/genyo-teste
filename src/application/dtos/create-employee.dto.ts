import { ClosingPeriodicity } from "@/domain/enums";
import { z } from "zod";

const time = z.iso.time({ precision: -1 });
const date = z.iso.date();

export const CreateEmployeeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .regex(/^\D+$/, "Name must not contain numbers"),
    hireDate: date,
    terminationDate: date.optional(),
    workdayStartTime: time,
    workdayEndTime: time,
    closingPeriodicity: z.enum(ClosingPeriodicity)
  })
  .refine(
    ({ terminationDate, hireDate }) =>
      !terminationDate || terminationDate >= hireDate,
    {
      message: "Termination date must not be before hire date",
      path: ["terminationDate"]
    }
  )
  .refine(
    ({ workdayStartTime, workdayEndTime }) =>
      workdayEndTime >= workdayStartTime,
    {
      message: "Workday end time must not be before start time",
      path: ["workdayEndTime"]
    }
  );

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;
