// src/plugins/prisma.ts
import { PrismaClient } from "../prisma/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import "dotenv/config";

// Augment FastifyInstance type
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

// Wrap with fastify-plugin to ensure it's treated as a root-level plugin
export default fp(prismaPlugin, {
  name: "prisma-plugin",
  fastify: "^5.6.2",
});
