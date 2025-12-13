// src/plugins/features/users.ts
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

// ✅ Type-only import: used only for error type checking
import { Prisma } from "../../prisma/generated/prisma/client.js";

async function usersPlugin(app: FastifyInstance) {
  // ---------- Validation Schemas ----------

  const userBaseSchema = {
    type: "object",
    properties: {
      id: { type: "integer" },
      email: { type: "string", format: "email" },
      firstName: { type: "string", nullable: true },
      lastName: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "email", "createdAt", "updatedAt"],
    additionalProperties: false,
  };

  const createUserSchema = {
    body: {
      type: "object",
      required: ["email", "password", "firstName", "lastName"],
      properties: {
        email: { type: "string", format: "email" },
        password: {
          type: "string",
          minLength: 8,
          pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        },
        firstName: { type: "string", minLength: 1 },
        lastName: { type: "string", minLength: 1 },
      },
      additionalProperties: false,
    },
    response: {
      // ✅ Success
      201: userBaseSchema,
      // ✅ Conflict: email already exists
      409: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
      // Optional: add 400 for validation (handled automatically by Fastify)
      // Optional: add 500 if you throw server errors
    },
  };

  const getAllUsersSchema = {
    response: {
      200: { type: "array", items: userBaseSchema },
    },
  };

  const getUserSchema = {
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "integer" } },
    },
    response: {
      200: userBaseSchema,
      404: { type: "object", properties: { error: { type: "string" } } },
    },
  };

  const updateUserSchema = {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "integer" },
      },
    },
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        firstName: { type: "string", minLength: 1 },
        lastName: { type: "string", minLength: 1 },
      },
      additionalProperties: false,
    },
    response: {
      200: userBaseSchema,
      400: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      403: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      404: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      // ✅ Add 409 for email conflict
      409: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
    },
  };

  const deleteUserSchema = {
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "integer" } },
    },
    response: {
      204: { type: "null" },
      404: { type: "object", properties: { error: { type: "string" } } },
    },
  };

  // ---------- Routes ----------

  // GET /users — (consider protecting in prod)
  app.get("/", { schema: getAllUsersSchema }, async () => {
    // ⚠️ Add pagination in production
    return await app.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  // GET /users/:id — protected
  app.get(
    "/:id",
    { schema: getUserSchema, preHandler: app.authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const user = await app.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply
          .status(404)
          .send({ error: `User with ID ${id} not found` });
      }
      return user;
    },
  );

  // POST /users — public registration
  app.post("/", { schema: createUserSchema }, async (request, reply) => {
    const { email, password, firstName, lastName } = request.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    const existing = await app.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await app.prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return reply.status(201).send(user);
  });

  // PUT /users/:id — protected
  app.put(
    "/:id",
    { schema: updateUserSchema, preHandler: app.authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: number };

      // 🔒 Optional: Ensure user can only update themselves
      if (request.currentUser?.id !== id) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const { email, firstName, lastName } = request.body as {
        email?: string;
        firstName?: string;
        lastName?: string;
      };

      if (!email && !firstName && !lastName) {
        return reply
          .status(400)
          .send({ error: "At least one field must be provided" });
      }

      // 🔐 Check email uniqueness if email is being changed
      if (email !== undefined) {
        const existing = await app.prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== id) {
          return reply.status(409).send({ error: "Email already in use" });
        }
      }

      // ✅ Only include defined fields
      const data = {
        ...(email !== undefined ? { email } : {}),
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
      };

      try {
        const user = await app.prisma.user.update({
          where: { id },
          data,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return user;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return reply
              .status(404)
              .send({ error: `User with ID ${id} not found` });
          }
        }
        throw error; // let Fastify handle unexpected errors
      }
    },
  );

  // DELETE /users/:id — protected
  app.delete(
    "/:id",
    { schema: deleteUserSchema, preHandler: app.authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: number };

      try {
        await app.prisma.user.delete({ where: { id } });
        return reply.status(204).send();
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          return reply
            .status(404)
            .send({ error: `User with ID ${id} not found` });
        }
        throw error;
      }
    },
  );
}

export default fp(usersPlugin, {
  name: "users-plugin",
  fastify: "^5.6.2",
});
