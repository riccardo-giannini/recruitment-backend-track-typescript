// src/index.ts
import "dotenv/config";
import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";

const start = async () => {
  const fastify = Fastify({ logger: true });

  try {
    await fastify.register(prismaPlugin);

    fastify.get("/users", async () => {
      const users = await fastify.prisma.user.findMany();
      return users;
    });

    fastify.get("/ping", async () => {
      return "pong\n";
    });

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server listening on http://0.0.0.0:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
