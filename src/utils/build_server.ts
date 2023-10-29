import Fastify, { FastifyInstance } from "fastify";
import { dbConnectionPlugin } from "../config/dbConnection";
import jwt from "jsonwebtoken";
import "dotenv/config";

// PLUGINS
import fp from "fastify-plugin";
import fastifyGracefulShutdown = require("fastify-graceful-shutdown");
import fastifyJwt = require("@fastify/jwt");
import { decorateFastifyIntance } from "./decorate_server";
import { makeSocketRequireUser, requireUser } from "./require_user";

// ENDPOINT CONTROLLERS
import StockController from "../stock";
import UserController from "../user";
import WalletController from "../wallet";
import WatchlistController from "../watchlist";
import fastifyIO from "fastify-socket.io";
import { Server, Socket } from "socket.io";
import { NextFn } from "types";
import { attachWatchlist } from "./attachWatchlist";

const defaultOptions = {
  logger: {
    transport: {
      target: "pino-pretty",
    },
    level: "debug",
  },
};

declare module "fastify" {
  interface FastifyInstance {
    io: Server<{ hello: string }>;
  }
}

let timer: any;

async function io(app: FastifyInstance) {
  app.ready(async () => {
    app.io.use(makeSocketRequireUser(app)); // jwt token authentication
    app.io.use(attachWatchlist(app)); // attaches user's watch list to socket instance
    app.io.on("connection", (socket: any) => {
      if (!timer) {
        timer = setInterval(async () => {
          const updatedWatchlist = await Promise.all(
            socket.watchlist.map(async (stock: string) => {
              return await app.stockService.getCachedOrFetchStockQuote(stock);
            })
          );
          socket.emit("stock:minute-update", {
            id: socket.user.id,
            data: updatedWatchlist,
          });
        }, 2000);
      }
      socket.on("disconnect", () => {
        socket.disconnect();
      });
    });
  });
}

export function buildServer(serverOpts = defaultOptions): FastifyInstance {
  const jwtSecret = process.env.JWT_SECRET || "secret";
  const fastify = Fastify(serverOpts);
  fastify
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
    .register(io)
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
