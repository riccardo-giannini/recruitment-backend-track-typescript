// src/plugins/prisma.ts
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

// ✅ Runtime import via default export
import {PrismaClient} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import "dotenv/config";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
};

export default prismaPlugin;