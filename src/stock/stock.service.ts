import { Dependencies } from "../infrastructure/di";
import { createCacheKey } from "../utils/create_cachekey";
import StockWebSocketClient from "../infrastructure/stockWebSocketClient";

type ConstructorType = Pick<
  Dependencies,
  "stockRepository" | "stockMarketAPI" | "cache"
>;

// class StockWebSocketClient {
//   private server: any;

//   constructor({ publisher, server }: { publisher: IPublisher; server: any }) {
//     this.publisher = publisher;
//     this.server = server;
//     this.init();
//   }

//   init() {
//     // this.server.on("open", this.init);
//     this.server.on("message", this.messageHandler);
//   }

//   messageHandler(data: any) {
//     const info = JSON.parse(data.toString());
//     if (info.event === EVENTS.PRICE) {
//       this.publisher.publish({ channel: info.event, message: info });
//       // cache[info.symbol].forEach((id: number) => {
//       //   let fId = String(id);
//       //   // @ts-ignore
//       //   app.io.of("/").in(fId).emit("price", JSON.stringify(info));
//       // });
//     }
//     console.log(JSON.parse(data.toString()));
//   }
// }

class StockService {
  private stockRepository: Dependencies["stockRepository"];
  private stockMarketAPI: Dependencies["stockMarketAPI"];
  private cache: Dependencies["cache"];
  private stockWebSocketClient: Dependencies["stockWebsocketClient"] | null;

  constructor({
    stockRepository,
    stockMarketAPI,
    cache,
    stockWebsocketClient,
  }: ConstructorType & {
    stockWebsocketClient: StockWebSocketClient | undefined;
  }) {
    this.stockRepository = stockRepository;
    this.stockMarketAPI = stockMarketAPI;
    this.cache = cache;
    if (stockWebsocketClient) {
      this.stockWebSocketClient = stockWebsocketClient;
    } else {
      this.stockWebSocketClient = null;
    }
    this.init();
  }

  init() {
    // this.stockWebSocketClient?.messageListener(this.notify);
  }

  async getStockDBRef({ symbol }: { symbol: string }) {
    return await this.stockRepository.findOrCreate({ symbol });
  }

  async getStockQuote({ symbol }: { symbol: string }) {
    return await this.stockMarketAPI.getStockQuote({ symbol });
  }

  async getCachedOrFetchStockQuote({ symbol }: { symbol: string }) {
    const cacheKey = createCacheKey(symbol);
    const existsInCache = await this.cache.exists(cacheKey);
    // CACHE HIT
    if (existsInCache) {
      const stockQuote = await this.cache.hgetall(cacheKey);
      return stockQuote;
    }
    // CACHE MISS
    const data = await this.getStockQuote({ symbol });
    await this.cache.hset(cacheKey, data);

    return data;
  }

  async subscribeToRealtimeUpdates({
    symbols,
  }: {
    symbols: string | string[];
  }) {
    if (this.stockWebSocketClient) {
      if (typeof symbols === "string") {
        await this.stockWebSocketClient.send({
          action: "subscribe",
          params: {
            symbols: symbols,
          },
        });
      } else if (symbols instanceof Array) {
        await this.stockWebSocketClient.send({
          action: "subscribe",
          params: {
            symbols: symbols.join(","),
          },
        });
      }
    }
  }

  async onRealtimeUpdates(handler: (...args: any) => any) {
    if (this.stockWebSocketClient) {
      this.stockWebSocketClient.on(
        this.stockWebSocketClient.PRICE_CHANGE,
        handler
      );
    }
  }
}

export default StockService;

// Perfect world
// stockService.register(this)
// stockService.subscribe("appl,amzn")
// stockService.subscribe("meta")
// update(subject, data) {
//    io.emit("price", data)
// }
