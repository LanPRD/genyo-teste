import { z } from "zod";

export const ListEmployeesSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(10).meta({
      description: "Quantidade de funcionários por página, de 1 a 100.",
      example: 10
    }),
    cursor: z.string().min(1).optional().meta({
      description:
        "Cursor da página anterior (`meta.nextCursor`). Omita para a primeira página.",
      example: "6297e9bb-4629-4cbe-8837-f0394e92f0c5"
    })
  })
  .meta({ id: "ListEmployeesQuery" });

export type ListEmployeesDto = z.input<typeof ListEmployeesSchema>;
