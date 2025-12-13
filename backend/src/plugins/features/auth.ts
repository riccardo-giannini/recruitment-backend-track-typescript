// src/plugins/auth.ts
import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type {
  FastifyInstance,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from "fastify";
import "dotenv/config";

// 👇 Use `currentUser` instead of `user`
declare module "fastify" {
  interface FastifyRequest {
    currentUser?: { id: number; email: string };
  }

  interface FastifyInstance {
    signJWT: (payload: { id: number; email: string }) => Promise<string>;
    authenticate: preHandlerAsyncHookHandler;
  }
}

async function authPlugin(app: FastifyInstance) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in .env");
  }

  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: "24h" },
  });

  app.decorate(
    "signJWT",
    async function (payload: { id: number; email: string }) {
      return app.jwt.sign(payload);
    },
  );

  app.decorate("authenticate", async function (request: FastifyRequest, reply) {
    try {
      const payload = await request.jwtVerify<{ id: number; email: string }>();
      request.currentUser = payload;
    } catch (err) {
      // Log the actual error (e.g., token expired, malformed, etc.)
      request.log.warn({ err }, "JWT verification failed");
      reply
        .status(401)
        .send({ error: "Unauthorized", message: "Invalid or missing token" });
    }
  });
}

export default fp(authPlugin, {
  name: "auth-plugin",
  fastify: "^5.6.2",
});
