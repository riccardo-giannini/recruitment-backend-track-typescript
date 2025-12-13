// src/index.ts
import "dotenv/config";
import Fastify from "fastify";
import prismaPlugin from "./plugins/db.js";
import authPlugin from "./plugins/auth.js";
import usersPlugin from "./plugins/features/users.js";

const start = async () => {
  const fastify = Fastify({ logger: true });

  try {
    await fastify.register(prismaPlugin);
    await fastify.register(authPlugin); // ← must come before route plugins that use `authenticate`
    await fastify.register(usersPlugin, { prefix: "/api/users" });

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server listening on http://0.0.0.0:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
