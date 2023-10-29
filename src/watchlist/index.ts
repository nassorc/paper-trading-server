import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { NextFn } from "types";

export default function (
  app: FastifyInstance,
  opts: FastifyPluginOptions,
  next: NextFn
) {
  app.register(function (app, opts: FastifyPluginOptions, next: NextFn) {
    app.addHook("preHandler", app.requireUser);
    app.get(
      "/user/watchlist",
      async (
        request: FastifyRequest<{ Params: { userId: number } }>,
        reply: FastifyReply
      ) => {
        // @ts-ignore
        const userId = request.user.id;
        const watchlist =
          (await app.watchlistService.getUserWatchlist(userId)) || [];
        return reply.code(200).send({ watchlist: watchlist });
      }
    );
    app.post(
      "/user/watchlist/add",
      async (
        request: FastifyRequest<{ Body: { symbol: string } }>,
        reply: FastifyReply
      ) => {
        const symbol = request.body.symbol;
        // @ts-ignore
        const userId = request.user.id;
        await app.watchlistService.addSymbolToWatchlist(userId, symbol);
        return reply.code(201).send({ message: "added" });
      }
    );
    next();
  });

  next();
}
