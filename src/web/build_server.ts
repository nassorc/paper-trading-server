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
import { Server } from "socket.io";
import { attachWatchlist } from "./attach_watchlist";
import cors from "@fastify/cors";

//ws.twelvedata.com/v1/quotes/price?apikey=1ff192f9bc354f349eeb9cffe7fe8fb1
import WebSocket from "ws";
let sample = {
  event: "price",
  symbol: "AAPL",
  currency: "USD",
  exchange: "NASDAQ",
  mic_code: "XNGS",
  type: "Common Stock",
  timestamp: 1700528335,
  price: 191.58,
};

declare module "fastify" {
  interface FastifyInstance {
    io: Server<{ hello: string }>;
  }
}

let timer: any;

let cache: any = {};
let id: string;

async function io(app: FastifyInstance) {
  app.ready(async () => {
    // websocket client
    const ws = new WebSocket(
      "wss://ws.twelvedata.com/v1/quotes/price?apikey=1ff192f9bc354f349eeb9cffe7fe8fb1"
    );
    ws.on("open", () => {
      app.io.use(makeSocketRequireUser(app)); // jwt token authentication
      app.io.on("connection", async (socket: any) => {
        id = String(socket.user.id);
        socket.join(id);

        // socket.emit("greetings", "hello user");
        app.log.info(`${socket.user.id} connected`);

        const watchlist = ["AAPL", "BTC/USD"];
        const watchlists: any = {
          1: ["AAPL", "BTC/USD"],
          134: ["EUR/USD"],
        };

        watchlists[socket.user.id].forEach((symbol: string) => {
          socket.join(symbol);
          if (symbol in cache) {
            cache[symbol].push(socket.user.id);
          } else {
            ws.send(
              JSON.stringify({
                action: "subscribe",
                params: {
                  symbols: symbol,
                },
              })
            );
            cache[symbol] = [socket.user.id];
          }
        });

        cache["AAPL"].forEach((id: number) => console.log(id));
      });
      ws.on("message", (data) => {
        const info = JSON.parse(data.toString());
        if (info.event === "price") {
          console.log(info.symbol);
          cache[info.symbol].forEach((id: number) => {
            let fId = String(id);
            // @ts-ignore
            app.io.of("/").in(fId).emit("price", JSON.stringify(info));
          });
        }
        // users.forEach(() => {
        //   socket.emit("price", info);
        // });
        console.log(JSON.parse(data.toString()));
      });
    });
  });
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
    .register(io)
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
