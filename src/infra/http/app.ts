import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Container } from "./container";
import { createEmployeeRoutes } from "./controllers/employee/employee.routes";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";

export interface AppOptions {
  corsOrigin?: string;
}

export function createApp(container: Container, options: AppOptions = {}) {
  const app = express();

  const origins = (options.corsOrigin ?? "*").split(",").map(o => o.trim());

  app.use(helmet());
  app.use(cors({ origin: origins.includes("*") ? "*" : origins }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => container.health.handle(req, res));
  app.use("/employees", createEmployeeRoutes(container.employee));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
