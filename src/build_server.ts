import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import StockService from "./stock/service";
import { redisPlugin } from "./config/connectToRedis";
import { IStockDataSource } from "types";
import StockHandler from "./stock";
import fp from "fastify-plugin";
import StockDataSourceAPI from "./stock/data_source";
import fastifyGracefulShutdown = require("fastify-graceful-shutdown");

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
    .register(fastifyGracefulShutdown)
    .register(redisPlugin)
    .register(fp(decorateFastifyIntance))
    .register(StockHandler)
    .after(() => {
      fastify.gracefulShutdown(async (signal, next) => {
        if (["SIGINT", "SIGTERM"].includes(signal)) {
          await fastify.close();
        }
        next();
      });
    });

  return fastify;
}
