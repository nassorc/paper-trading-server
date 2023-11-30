import StockService from "../stock/stock.service";

// TODO: Rename `SocketManager` Class. Name doesn't fit the responsibility of the class
// and doesn't really mangage the socker server, but starts and build it instead.
class RealtimeWatchlistServer {
  private server: any;
  private stockService: StockService;
  private middlewares: any[];

  private stockToUserMap: any = {};

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
      const socketId = socket.id;
      const userId = String(socket.user.id);

      socket.join(String(userId));

      for (const stock of socket.watchlist) {
        if (stock in this.stockToUserMap) {
          this.stockToUserMap[stock].push(userId);
        } else {
          // subscribe user's watchlist to realtime updates
          await this.stockService.subscribeToRealtimeUpdates({
            symbols: socket.watchlist,
          });
          this.stockToUserMap[stock] = [userId];
        }
      }
    });

    this.stockService.onRealtimeUpdates((data: any) => {
      const info = JSON.parse(data.toString());
      const symbol = info.symbol;

      if (symbol && this.stockToUserMap[symbol]) {
        this.stockToUserMap[symbol].forEach((id: string) => {
          this.server
            .of("/")
            .in(id)
            .emit("price", this.toPayload(data.toString()));
        });
      }
    });
  }
  toPayload(data: { symbol: string; timestamp: number; price: number }) {
    return data;
  }
}
export default RealtimeWatchlistServer;
