// include schema
// collect routes and attach correct handler
// write handler functions

import {
  FastifyError,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  $ref,
  StockQuoteType,
  StockOrderType,
  StockSellType,
} from "./stock.schema";
import { NextFn } from "types";

export default function (
  app: FastifyInstance,
  options: FastifyPluginOptions,
  next: () => void
) {
  app.get(
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
  app.register(function (app, options, next: NextFn) {
    app.addHook("preHandler", app.requireUser);
    app.post(
      "/stock/buy",
      { schema: { body: $ref("purchaseStockInput") } },
      purchaseStockHandler
    );
    app.post(
      "/stock/sell",
      { schema: { body: $ref("sellStockInput") } },
      sellStockHandler
    );
    next();
  });

  // CONTROLLER ERROR HANDLER
  app.setErrorHandler(function (
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

async function stockHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { symbol: string } }>,
  reply: FastifyReply
) {
  const symbol = request.params.symbol;
  const data = await this.stockService.getCachedOrFetchStockQuote(symbol);

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
  return reply.code(201).send(request.body);
}

async function sellStockHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: StockSellType }>,
  reply: FastifyReply
) {
  // create order
  const order = request.body;
  const userId = (request.user as any).id;
  const orderReceived = this.stockService.sellStockPosition(
    userId,
    order.symbol,
    order.quantity
  );
  return reply.code(201).send(request.body);
}
