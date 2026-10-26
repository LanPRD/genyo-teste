import { HttpStatus } from "@/core/errors";
import type { Request, Response } from "express";

export type DatabaseCheck = () => Promise<void>;

export class HealthController {
  constructor(private readonly checkDatabase: DatabaseCheck) {}

  async handle(_req: Request, res: Response) {
    try {
      await this.checkDatabase();

      res.json({ status: "ok", database: "up" });
    } catch {
      res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ status: "error", database: "down" });
    }
  }
}
