import { prisma } from "@/infra/database/prisma/prisma.service";
import { PrismaUserRepository } from "@/infra/database/repositories";
import { env } from "@/infra/env/env";
import { createApp } from "@/infra/http/app";
import { createContainer } from "@/infra/http/container";

const container = createContainer({
  userRepository: new PrismaUserRepository(prisma),
  checkDatabase: async () => {
    await prisma.$runCommandRaw({ ping: 1 });
  }
});

const app = createApp(container, { corsOrigin: env.CORS_ORIGIN });

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
