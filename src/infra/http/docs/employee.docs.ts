import { CreateEmployeeSchema } from "@/application/dtos";
import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { EmployeeResponseSchema, ErrorResponseSchema } from "./schemas";

const errorResponse = (
  description: string,
  example: z.infer<typeof ErrorResponseSchema>
) => ({
  description,
  content: { "application/json": { schema: ErrorResponseSchema, example } }
});

const internalError = errorResponse("Erro interno.", {
  error: "INTERNAL_ERROR",
  message: "Unexpected internal error"
});

export function registerEmployeeDocs(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/employees",
    tags: ["Employees"],
    summary: "Cadastra um funcionário",
    description:
      "Valida os dados e cadastra o funcionário. A data de demissão é opcional e, quando informada, não pode ser anterior à admissão. O fim do expediente não pode ser anterior ao início.",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateEmployeeSchema,
            example: {
              name: "Maria da Silva",
              hireDate: "2026-01-10",
              terminationDate: "2026-12-31",
              workdayStartTime: "08:00",
              workdayEndTime: "17:00",
              closingPeriodicity: "MONTHLY"
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: "Funcionário cadastrado.",
        content: { "application/json": { schema: EmployeeResponseSchema } }
      },
      400: errorResponse("Dados inválidos.", {
        error: "VALIDATION_ERROR",
        message: "Invalid employee data",
        details: [
          { field: "name", message: "Name must not contain numbers" },
          {
            field: "workdayEndTime",
            message: "Workday end time must not be before start time"
          }
        ]
      }),
      500: internalError
    }
  });

  registry.registerPath({
    method: "get",
    path: "/employees/{id}",
    tags: ["Employees"],
    summary: "Busca um funcionário pelo id",
    request: {
      params: z.object({
        id: z.string().meta({
          description: "Identificador do funcionário.",
          example: "6297e9bb-4629-4cbe-8837-f0394e92f0c5"
        })
      })
    },
    responses: {
      200: {
        description: "Funcionário encontrado.",
        content: { "application/json": { schema: EmployeeResponseSchema } }
      },
      404: errorResponse("Funcionário não encontrado.", {
        error: "EMPLOYEE_NOT_FOUND",
        message:
          "Employee with id 6297e9bb-4629-4cbe-8837-f0394e92f0c5 not found"
      }),
      500: internalError
    }
  });
}
