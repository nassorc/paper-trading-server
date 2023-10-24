import Fastify, { FastifyInstance } from "fastify";
import { dbConnectionPlugin } from "../config/dbConnection";

// PLUGINS
import fp from "fastify-plugin";
import fastifyGracefulShutdown = require("fastify-graceful-shutdown");
import fastifyJwt = require("@fastify/jwt");
import { decorateFastifyIntance } from "./decorate_server";
import { requireUser } from "./require_user";

// ENDPOINT CONTROLLERS
import StockController from "../stock";
import UserController from "../user";
import WalletController from "../wallet";

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: "debug",
      enabled: true,
    },
  });
  fastify
    .register(fastifyGracefulShutdown)
    .register(dbConnectionPlugin)
    .register(fp(fastifyJwt), { secret: "secretKey" })
    .register(fp(decorateFastifyIntance))
    .register(fp(requireUser))
    .register(StockController)
    .register(UserController)
    .register(WalletController)
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
