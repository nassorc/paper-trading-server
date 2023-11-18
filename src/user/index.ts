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
  fastify.post(
    "/signin",
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
  fastify.post("/signup", registerHandler);
  fastify.post("/token/validate", validateTokenHandler);

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

async function validateTokenHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  try {
    const payload = this.jwt.verify(request.body.token);
    return reply.code(200).send({ valid: true });
  } catch (err) {
    return reply.code(200).send({ valid: false });
  }
}
