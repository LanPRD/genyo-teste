import { ClosingPeriodicity } from "@/domain/enums";
import { z } from "zod";

export const EmployeeSchema = z
  .object({
    id: z.uuid().meta({
      description: "Identificador único do funcionário.",
      example: "6297e9bb-4629-4cbe-8837-f0394e92f0c5"
    }),
    name: z
      .string()
      .meta({ description: "Nome do funcionário.", example: "Maria da Silva" }),
    hireDate: z.iso.datetime().meta({
      description: "Data de admissão.",
      example: "2026-01-10T00:00:00.000Z"
    }),
    terminationDate: z.iso.datetime().nullable().meta({
      description: "Data de demissão. Nulo para funcionário ativo.",
      example: null
    }),
    workdayStartTime: z.string().meta({
      description: "Hora de início do expediente (HH:mm).",
      example: "08:00"
    }),
    workdayEndTime: z.string().meta({
      description: "Hora de fim do expediente (HH:mm).",
      example: "17:00"
    }),
    closingPeriodicity: z.enum(ClosingPeriodicity).meta({
      description: "Periodicidade do fechamento.",
      example: ClosingPeriodicity.MONTHLY
    }),
    createdAt: z.iso.datetime().meta({
      description: "Data de criação do registro.",
      example: "2026-11-01T20:52:15.031Z"
    }),
    updatedAt: z.iso.datetime().meta({
      description: "Data da última atualização do registro.",
      example: "2026-11-01T20:52:15.031Z"
    })
  })
  .meta({ id: "Employee", description: "Funcionário cadastrado." });

export const EmployeeResponseSchema = z
  .object({ data: EmployeeSchema })
  .meta({ id: "EmployeeResponse" });

export const EmployeeListResponseSchema = z
  .object({
    data: z.array(EmployeeSchema),
    meta: z.object({
      limit: z.number().meta({
        description: "Tamanho da página solicitado.",
        example: 10
      }),
      nextCursor: z.string().nullable().meta({
        description:
          "Cursor para buscar a próxima página. Nulo na última página.",
        example: "6297e9bb-4629-4cbe-8837-f0394e92f0c5"
      })
    })
  })
  .meta({ id: "EmployeeListResponse" });

export const ErrorResponseSchema = z
  .object({
    error: z.string().meta({
      description: "Código do erro.",
      example: "VALIDATION_ERROR"
    }),
    message: z.string().meta({
      description: "Descrição do erro.",
      example: "Invalid employee data"
    }),
    details: z
      .array(
        z.object({
          field: z.string().meta({
            description: "Campo inválido.",
            example: "workdayEndTime"
          }),
          message: z.string().meta({
            description: "Motivo da invalidação.",
            example: "Workday end time must not be before start time"
          })
        })
      )
      .optional()
      .meta({
        description: "Erros por campo, presentes em erros de validação."
      })
  })
  .meta({ id: "ErrorResponse" });

export const HealthResponseSchema = z
  .object({
    status: z
      .enum(["ok", "error"])
      .meta({ description: "Estado da API.", example: "ok" }),
    database: z
      .enum(["up", "down"])
      .meta({ description: "Estado do MongoDB.", example: "up" })
  })
  .meta({ id: "HealthResponse" });
