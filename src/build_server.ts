import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import { redisPlugin } from "./lib/redis";
import StockService from "./stock/service";
import { IStockDataSource } from "types";
import StockHandler from "./stock";
import fp from "fastify-plugin";
import StockDataSourceAPI from "./stock/data_source";

declare module "fastify" {
  export interface FastifyInstance {
    stockService: IStockDataSource;
  }
}

function decorateFastifyIntance(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  const stockService = new StockService(new StockDataSourceAPI());
  fastify.decorate("stockService", stockService);
  done();
}

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true,
  });
  fastify
    .register(redisPlugin)
    .register(fp(decorateFastifyIntance))
    .register(StockHandler);

  return fastify;
}
