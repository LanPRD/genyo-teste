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
      .regex(/^\D+$/, "Name must not contain numbers")
      .meta({
        description: "Nome do funcionário. Não pode conter números.",
        example: "Maria da Silva"
      }),
    hireDate: date.meta({
      description: "Data de admissão, no formato YYYY-MM-DD.",
      example: "2026-01-10"
    }),
    terminationDate: date
      .meta({
        description:
          "Data de demissão, no formato YYYY-MM-DD. Omita para funcionário ativo. Não pode ser anterior à admissão.",
        example: "2026-12-31"
      })
      .optional(),
    workdayStartTime: time.meta({
      description: "Hora de início do expediente, no formato HH:mm.",
      example: "08:00"
    }),
    workdayEndTime: time.meta({
      description:
        "Hora de fim do expediente, no formato HH:mm. Não pode ser anterior ao início.",
      example: "17:00"
    }),
    closingPeriodicity: z.enum(ClosingPeriodicity).meta({
      description:
        "Periodicidade do fechamento: MONTHLY (mensal), BIMONTHLY (bimestral), QUARTERLY (trimestral), SEMIANNUAL (semestral) ou ANNUAL (anual).",
      example: ClosingPeriodicity.MONTHLY
    })
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
  )
  .meta({
    id: "EmployeeInput",
    description: "Dados de um funcionário, usados no cadastro e na edição."
  });

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;
