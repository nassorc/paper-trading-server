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
      {
        schema: {
          body: {
            type: "object",
            required: ["amount"],
            properties: { amount: { type: "number" } },
          },
        },
      },
      addFundsHander
    );
    fastify.post("/wallet/subtract-funds", subtractFundsHander);
    next();
  });
  next();
}

async function addFundsHander(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { amount: number } }>,
  reply: FastifyReply
) {
  const amount = request.body.amount;
  // @ts-ignore
  const userId = request.user.id;
  const updatedWallet = await this.walletService.addAmount(userId, amount);

  return reply
    .code(201)
    .send({ message: "amount added", amount: updatedWallet.funds });
}

async function subtractFundsHander(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { amount: number } }>,
  reply: FastifyReply
) {
  const amount = request.body.amount;
  // @ts-ignore
  const userId = request.user.id;
  await this.walletService.subtractAmount(userId, amount);

  return reply.code(201).send({ message: "amount added" });
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
