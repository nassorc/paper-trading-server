import StockService from "../stock/stock.service";

// TODO: Rename `SocketManager` Class. Name doesn't fit the responsibility of the class
// and doesn't really mangage the socker server, but starts and build it instead.
class RealtimeWatchlistServer {
  private server: any;
  private stockService: StockService;
  private middlewares: any[];

  constructor({
    server,
    stockService,
    middleware,
  }: {
    server: any;
    stockService: StockService;
    middleware?: any;
  }) {
    this.server = server;
    this.stockService = stockService;
    if (middleware) {
      this.middlewares = middleware;
    } else {
      this.middlewares = [];
    }
  }

  addMiddleware({ middlewares }: { middlewares: any[] }) {
    this.middlewares.concat(middlewares);
  }

  build() {
    this.middlewares.forEach(async (m) => {
      await this.server.use(m);
    });
    this.server.on("connection", async (socket: any) => {
      console.log(`user ${socket.id} connected.`);
      console.dir(socket.user, { depth: Infinity });
      this.stockService.subscribeToRealtimeUpdates({ symbols: "BTC/USD" });
      this.stockService.onRealtimeUpdates((data: any) => {
        this.server.emit("price", data);
      });
    });
  }
}
export default RealtimeWatchlistServer;

// let timer: any;
// let cache: any = {};
// let id: string;
// let watchlists: any = {};

// // PLAN: decouple WS Stock API from Server socket
// // 1. Create WS class that connects to the api's ws
// // 2. Create Socket class for server/client comms
// // 3. create itermediary pub/sub that both ws and socket class will use to communicate
// // 4. create cache to map symbol/users

// async function io(app: FastifyInstance) {
//   app.ready(async () => {
//     // websocket client
//     const ws = new WebSocket(
//       "wss://ws.twelvedata.com/v1/quotes/price?apikey=1ff192f9bc354f349eeb9cffe7fe8fb1"
//     );

//     ws.on("open", () => {
//       // require authenticated user
//       app.io.use(makeSocketRequireUser(app));

//       app.io.on("connection", async (socket: any) => {
//         console.dir(socket.user, { depth: Infinity });
//         id = String(socket.user.id);
//         socket.join(id);

//         app.log.info(`${socket.user.id} connected`);

//         const res = await app.watchlistService.getUserWatchlist(socket.user.id);
//         const userWatchlist = res?.symbols.map((stock) => stock.symbol);
//         console.log(userWatchlist);

//         watchlists[Number(id)] = userWatchlist;
//         watchlists[Number(id)].push("BTC/USD");

//         // const watchlists: any = {
//         //   134: ["AAPL", "BTC/USD"],
//         //   1: ["EUR/USD"],
//         // };
//         console.log(watchlists);

//         watchlists[socket.user.id].forEach((symbol: string) => {
//           socket.join(symbol);
//           if (symbol != "META") {
//             if (symbol in cache) {
//               cache[symbol].push(socket.user.id);
//             } else {
//               ws.send(
//                 JSON.stringify({
//                   action: "subscribe",
//                   params: {
//                     symbols: symbol,
//                   },
//                 })
//               );
//               cache[symbol] = [socket.user.id];
//             }
//           }
//         });
//       });
//       ws.on("message", (data) => {
//         const info = JSON.parse(data.toString());
//         if (info.event === "price") {
//           cache[info.symbol].forEach((id: number) => {
//             let fId = String(id);
//             // @ts-ignore
//             app.io.of("/").in(fId).emit("price", JSON.stringify(info));
//           });
//         }
//         console.log(JSON.parse(data.toString()));
//       });
//     });
//   });
// }
