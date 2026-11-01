import type { z } from "zod";
import { CreateEmployeeSchema } from "./create-employee.dto";

// A edição aplica as mesmas regras de validação do cadastro.
export const UpdateEmployeeSchema = CreateEmployeeSchema;

export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>;
