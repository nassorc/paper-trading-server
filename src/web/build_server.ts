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
import { Redis } from "ioredis";
import StockService from "../stock/stock.service";
import { IObserver, ISubject } from "types";
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
let watchlists: any = {};

// PLAN: decouple WS Stock API from Server socket
// 1. Create WS class that connects to the api's ws
// 2. Create Socket class for server/client comms
// 3. create itermediary pub/sub that both ws and socket class will use to communicate
// 4. create cache to map symbol/users

const PRICE_CHANNEL = "price";

enum EVENTS {
  PRICE = "price",
}
interface IPublisher {
  publish(params: { channel: string; message: any }): Promise<void>;
}
interface ISubscriber {
  subscribe(
    channel: string,
    cb: (channel: any, message: any) => void
  ): Promise<void>;
}

class Publisher implements IPublisher {
  private publisher;
  constructor({ publisher }: { publisher: Redis }) {
    this.publisher = publisher;
  }
  async publish({ channel, message }: { channel: string; message: any }) {
    this.publisher.publish(channel, message);
  }
}
class Subscriber implements ISubscriber {
  private subscriber: Redis;
  constructor({ subscriber }: { subscriber: Redis }) {
    this.subscriber = subscriber;
  }
  async subscribe(channel: string, fn: (channel: any, message: any) => void) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on("message", fn);
  }
}

class StockWebSocketClient {
  private server: any;
  private stockService: StockService;

  constructor({
    server,
    stockService,
  }: {
    server: any;
    stockService: StockService;
  }) {
    this.server = server;
    this.stockService = stockService;
    this.init();
  }

  init() {
    this.server.on("open", this.init);
    this.server.on("message", this.messageHandler);
  }

  messageHandler(data: any) {
    // const info = JSON.parse(data.toString());
    // if (info.event === EVENTS.PRICE) {
    //   this.publisher.publish({ channel: info.event, message: info });
    //   // cache[info.symbol].forEach((id: number) => {
    //   //   let fId = String(id);
    //   //   // @ts-ignore
    //   //   app.io.of("/").in(fId).emit("price", JSON.stringify(info));
    //   // });
    // }
    // console.log(JSON.parse(data.toString()));
  }
}

// TODAY's GOAL: get SocketManageer class running

class SocketManager implements IObserver {
  private server: any;
  private stockService: StockService;

  constructor({
    server,
    stockService,
  }: {
    server: any;
    stockService: StockService;
  }) {
    this.server = server;
    this.stockService = stockService;
    this.init();
  }

  init() {
    this.stockService.attach(this);
    this.server.on("connection", async (socket: any) => {
      console.log(`user ${socket.id} connected ${socket.user}`);
    });
  }
  update(subject: ISubject, data: any): void {
    console.log("OBSERVER UPDATE CALLED");
  }
}

// async function IOServer(app: FastifyInstance) {
//   app.ready(() => {
//     app.io.on("connection", () => {
//     })
//   });

// }

async function io(app: FastifyInstance) {
  app.ready(async () => {
    // websocket client
    const ws = new WebSocket(
      "wss://ws.twelvedata.com/v1/quotes/price?apikey=1ff192f9bc354f349eeb9cffe7fe8fb1"
    );

    ws.on("open", () => {
      // require authenticated user
      app.io.use(makeSocketRequireUser(app));

      app.io.on("connection", async (socket: any) => {
        console.dir(socket.user, { depth: Infinity });
        id = String(socket.user.id);
        socket.join(id);

        app.log.info(`${socket.user.id} connected`);

        const res = await app.watchlistService.getUserWatchlist(socket.user.id);
        const userWatchlist = res?.symbols.map((stock) => stock.symbol);
        console.log(userWatchlist);

        watchlists[Number(id)] = userWatchlist;
        watchlists[Number(id)].push("BTC/USD");

        // const watchlists: any = {
        //   134: ["AAPL", "BTC/USD"],
        //   1: ["EUR/USD"],
        // };
        console.log(watchlists);

        watchlists[socket.user.id].forEach((symbol: string) => {
          socket.join(symbol);
          if (symbol != "META") {
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
          }
        });
      });
      ws.on("message", (data) => {
        const info = JSON.parse(data.toString());
        if (info.event === "price") {
          cache[info.symbol].forEach((id: number) => {
            let fId = String(id);
            // @ts-ignore
            app.io.of("/").in(fId).emit("price", JSON.stringify(info));
          });
        }
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
    // .register(io)
    // .register(IOServer)
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
