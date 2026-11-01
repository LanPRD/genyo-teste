import {
  OpenAPIRegistry,
  OpenApiGeneratorV31
} from "@asteasolutions/zod-to-openapi";
import { registerEmployeeDocs } from "./employee.docs";
import { registerHealthDocs } from "./health.docs";

export function createOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  registerHealthDocs(registry);
  registerEmployeeDocs(registry);

  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Genyo API",
      version: "1.0.0",
      description: "API de cadastro de funcionários."
    },
    servers: [{ url: "/" }],
    tags: [
      {
        name: "Employees",
        description: "Cadastro e consulta de funcionários."
      },
      { name: "Health", description: "Verificação de saúde da API." }
    ]
  });
}
