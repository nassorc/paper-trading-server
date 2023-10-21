import Fastify, {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { redisPlugin } from "./config/connectToRedis";
import StockService from "./stock/stock.service";
import { IStockDataSource } from "types";
import fp from "fastify-plugin";
import StockDataSourceAPI from "./stock/data_source";
import fastifyGracefulShutdown = require("fastify-graceful-shutdown");
import fastifyJwt = require("@fastify/jwt");

import StockController from "./stock";
import UserController from "./user";

import { userSchemas } from "./user/user.schema";
import { stockSchemas } from "./stock/stock.schema";

declare module "fastify" {
  export interface FastifyInstance {
    stockService: IStockDataSource;
    requireUser: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

function decorateFastifyIntance(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  // add schemas to be globally accessible
  for (const schema of [...userSchemas, ...stockSchemas]) {
    fastify.addSchema(schema);
  }
  const stockService = new StockService(new StockDataSourceAPI());
  fastify.decorate("stockService", stockService);
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
  done();
}

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: "debug",
      enabled: true,
    },
  });
  fastify
    .register(fastifyGracefulShutdown)
    .register(redisPlugin)
    .register(fp(fastifyJwt), { secret: "secretKey" })
    .register(fp(decorateFastifyIntance))
    .register(StockController)
    .register(UserController)
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
