import Fastify, { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import cors from "@fastify/cors";
import RealtimeWatchlistServer from "./realtime_watchlist_server";
import { dbConnectionPlugin } from "../config/dbConnection";
import "dotenv/config";

// PLUGINS
import fp from "fastify-plugin";
import fastifyIO from "fastify-socket.io";
import fastifyGracefulShutdown = require("fastify-graceful-shutdown");
import fastifyJwt = require("@fastify/jwt");
import { decorateFastifyIntance } from "./decorate_server";
import { makeSocketRequireUser, requireUser } from "./require_user";

// ENDPOINT CONTROLLERS
import StockController from "../stock";
import UserController from "../user";
import WalletController from "../wallet";
import WatchlistController from "../watchlist";
import { attachWatchlist } from "./attach_watchlist";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

export function buildServer(opts?: any): FastifyInstance {
  const jwtSecret = process.env.JWT_SECRET || "secret";
  const fastify = Fastify({
    logger: opts?.logger && {
      transport: {
        target: "pino-pretty",
      },
      level: opts?.level || "info",
    },
  });

  fastify
    .register(cors, {
      origin: "*",
    })
    .register(dbConnectionPlugin)
    .register(fastifyIO)
    .register(fastifyGracefulShutdown)
    .register(fp(fastifyJwt), { secret: jwtSecret })
    .register(fp(decorateFastifyIntance))
    .register(fp(requireUser))
    .register(StockController)
    .register(UserController)
    .register(WalletController)
    .register(WatchlistController)
    .register(async function buildIOServer(app, opts, next) {
      const authenticationMW = await makeSocketRequireUser(app);
      const watchlistMW = await attachWatchlist(app);
      new RealtimeWatchlistServer({
        server: app.io,
        stockService: app.stockService,
        middleware: [authenticationMW, watchlistMW],
      }).build();
      next();
    })
    .after(() => {
      fastify.gracefulShutdown(async (signal, next) => {
        if (["SIGINT", "SIGTERM"].includes(signal)) {
          await fastify.redis.shutdown();
          await fastify.redis.quit();
          await fastify.close();
        }
        next();
      });
    });

  return fastify;
}
