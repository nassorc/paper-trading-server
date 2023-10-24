import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyRegister,
  FastifyReply,
} from "fastify";
import { NextFn } from "types";
import { $ref, WalletInputType, WalletType } from "./wallet.schema";

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  next: NextFn
) {
  // LOGGED/PROCTED
  fastify.register(function (fastify: FastifyInstance, opts, next: NextFn) {
    // require logged user
    fastify.addHook("onRequest", fastify.requireUser);
    fastify.get(
      "/wallet/:id",
      {
        schema: {
          params: $ref("getWalletInput"),
          response: { 200: $ref("walletOutput") },
        },
      },
      getWalletHandler
    );
    fastify.post(
      "/wallet/add-funds",
      async function (
        this: FastifyInstance,
        request: FastifyRequest,
        reply: FastifyReply
      ) {
        const amount = (request.body as any).amount;
        const userId = (request.user as any).id;
        await this.walletService.addAmount(userId, amount);

        return reply.code(201).send({ message: "amount added" });
      }
    );
    next();
  });
  next();
}

async function getWalletHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: WalletInputType }>,
  reply: FastifyReply
) {
  const wallets = await this.db.wallet.findMany();
  console.dir(wallets, { depth: Infinity });
  return reply.code(200).send({ id: 0, funds: 1000 });
}
