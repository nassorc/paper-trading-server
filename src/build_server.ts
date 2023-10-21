import Fastify, {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { redisPlugin } from "./config/connectToRedis";
import { IStockDataSource } from "types";
import StockHandler from "./stock";
import fp from "fastify-plugin";
import StockDataSourceAPI from "./stock/data_source";
import fastifyGracefulShutdown = require("fastify-graceful-shutdown");
import fastifyJwt = require("@fastify/jwt");

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
