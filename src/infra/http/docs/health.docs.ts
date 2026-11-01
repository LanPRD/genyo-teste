import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { HealthResponseSchema } from "./schemas";

export function registerHealthDocs(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["Health"],
    summary: "Verifica a saúde da API",
    description:
      "Faz ping no MongoDB e responde 503 se o banco estiver indisponível.",
    responses: {
      200: {
        description: "API e banco disponíveis.",
        content: {
          "application/json": {
            schema: HealthResponseSchema,
            example: { status: "ok", database: "up" }
          }
        }
      },
      503: {
        description: "Banco indisponível.",
        content: {
          "application/json": {
            schema: HealthResponseSchema,
            example: { status: "error", database: "down" }
          }
        }
      }
    }
  });
}
