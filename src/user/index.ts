import fastify, {
  FastifyError,
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

  // CONTROLLER ERROR HANDLER
  fastify.setErrorHandler(function (
    this: FastifyInstance,
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // let default error handler handle user errors
    throw error;
  });

  next();
}

async function loginHander(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const user = await this.userService.loginUser(request.body);
  return reply.code(200).send({ accessToken: this.jwt.sign(user) });
}

async function registerHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { username: string; password: string } }>,
  reply: FastifyReply
) {
  const user = await this.userService.registerUser(request.body);
  return reply.code(201).send({ message: "created", userId: user.id });
}

async function userHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const user = await this.userService.getUserById(
    parseInt(request.params.userId)
  );
  // if (!user) return reply.code(404).send({ message: "user not found" });
  return reply.code(200).send(user);
}
