import { env } from "@/infra/env/env";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL
});

export type PrismaService = typeof prisma;
