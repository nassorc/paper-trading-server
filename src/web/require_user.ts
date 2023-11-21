import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function requireUser(fastify: FastifyInstance) {
  // route prehandler for handling logged routes
  fastify.decorate(
    "requireUser",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        // custom global onRequest hook provided by fastify-jwt wiil
        // attatch the decode payload to request.user
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
}

export function makeSocketRequireUser(app: FastifyInstance) {
  return async function (socket: any, next: (err?: any) => void) {
    try {
      let token = socket.handshake.headers.authorization;
      const payload = app.jwt.decode(token);
      if (!token) {
        next(new Error("Socket connection requires token"));
      }
      socket.user = payload;
      next();
    } catch (err: any) {
      next(new Error("Socket connection requires token"));
    }
  };
}
