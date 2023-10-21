import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { $ref, LoginInput } from "./user.schema";

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  next: () => void
) {
  // unprotected routes
  fastify.get("/health", (request, reply) => {
    return reply.code(200).send("healthy");
  });
  fastify.post(
    "/login",
    {
      schema: {
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginResponseSchema"),
        },
      },
    },
    loginHander
  );
  fastify.post("/register", registerHandler);
  // protected routes
  fastify.register(function (
    fastify: FastifyInstance,
    options,
    next: () => void
  ) {
    fastify.addHook("onRequest", fastify.requireUser);
    fastify.get("/user/:userId", userHandler);
    next();
  });
  next();
}

function loginHander(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const body = request.body;
  const token = this.jwt.sign(body);
  return reply.code(200).send({ accessToken: token });
}

function registerHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { username: string; password: string } }>,
  reply: FastifyReply
) {
  return reply.code(201).send({ message: "created" });
}

function userHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { username: string; password: string } }>,
  reply: FastifyReply
) {
  reply.code(200).send({ username: "mat" });
}
