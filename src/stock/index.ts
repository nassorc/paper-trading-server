// include schema
// collect routes and attach correct handler
// write handler functions

import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { $ref, StockQuoteType, StockOrderType } from "./stock.schema";
import { NextFn } from "types";

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  next: () => void
) {
  fastify.get(
    "/stock/:symbol",
    {
      schema: {
        params: $ref("getStockQuoteInput"),
        response: { 200: $ref("stockQuote") },
      },
    },
    stockHandler
  );
  // protected route
  fastify.register(function (fastify, options, next: NextFn) {
    fastify.addHook("preHandler", fastify.requireUser);
    fastify.post(
      "/stock",
      { schema: { body: $ref("purchaseStockInput") } },
      purchaseStockHandler
    );
    next();
  });
  next();
}

async function stockHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { symbol: string } }>,
  reply: FastifyReply
) {
  const symbol = request.params.symbol;
  const cacheKey = `quote:${symbol}`;
  // check if symbol in cache
  const existsInCache = await this.redis.exists(cacheKey);
  // CACHE HIT
  if (existsInCache) {
    this.log.debug("GET /stock CACHE HIT");
    const stockQuote = await this.redis.hgetall(cacheKey);
    return reply.code(200).send(stockQuote);
  }
  // CACHE MISS
  this.log.debug("GET /stock CACHE MISS");
  const data = await this.stockService.getStockQuote(symbol);
  await this.redis.hset(cacheKey, data);
  return reply.code(200).send(data);
}

async function purchaseStockHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: StockOrderType }>,
  reply: FastifyReply
) {
  // create order
  const order = request.body;
  const userId = (request.user as any).id;
  const orderReceived = this.stockService.purchaseStock(
    userId,
    order.symbol,
    order.quantity
  );
  // get current stock quote
  // get user's wallet
  // validate
  // make transaction
  // const stockInformation = this.stockService.getStockQuote(order.symbol);
  // const wallet = this.userService.getWallet(request.userId);
  // this.stockService.purchasStock(order, wallet);
  // publish message to observer
  return reply.code(201).send(request.body);
}
