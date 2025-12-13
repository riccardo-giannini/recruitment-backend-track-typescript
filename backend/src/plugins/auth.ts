// src/plugins/auth.ts
import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest } from "fastify";
import "dotenv/config";

// Define JWT payload type
declare module "fastify" {
  interface FastifyRequest {
    user?: { id: number; email: string };
  }
}

async function authPlugin(app: FastifyInstance) {
  // Ensure JWT secret is set
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in .env");
  }

  // Register @fastify/jwt
  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: "24h", // tokens expire after 24 hours
    },
  });

  // Utility: issue a JWT
  app.decorate(
    "signJWT",
    async function (payload: { id: number; email: string }) {
      return app.jwt.sign(payload);
    },
  );

  // Utility: verify token and attach user to request
  app.decorate("authenticate", async function (request: FastifyRequest, reply) {
    try {
      const user = await request.jwtVerify<{ id: number; email: string }>();
      request.user = user; // attach to request for downstream use
    } catch (err) {
      reply
        .status(401)
        .send({ error: "Unauthorized", message: "Invalid or missing token" });
    }
  });
}

export default fp(authPlugin, {
  name: "auth-plugin",
  fastify: "^5.6.2",
  dependencies: ["prisma-plugin"], // ensures db is ready if needed later
});
