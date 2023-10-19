// include schema
// collect routes and attach correct handler
// write handler functions

import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { getStockQuote } from "./schemas";

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  next: () => void
) {
  fastify.get("/stock/:symbol", { schema: getStockQuote }, stockHandler);
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
    const stockQuote = await this.redis.hgetall(cacheKey);
    return reply.code(200).send(stockQuote);
  }
  // CACHE MISS
  const data = await this.stockService.getStockQuote(symbol);
  await this.redis.hset(cacheKey, data);
  return reply.code(200).send(data);
}
