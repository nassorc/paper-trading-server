import { Dependencies } from "../infrastructure/di";
import { createCacheKey } from "../utils/create_cachekey";

type ConstructorType = Pick<
  Dependencies,
  "stockRepository" | "stockMarketAPI" | "cache"
>;

class StockService {
  private stockRepository: Dependencies["stockRepository"];
  private stockMarketAPI: Dependencies["stockMarketAPI"];
  private cache: Dependencies["cache"];

  constructor({ stockRepository, stockMarketAPI, cache }: ConstructorType) {
    this.stockRepository = stockRepository;
    this.stockMarketAPI = stockMarketAPI;
    this.cache = cache;
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
}

export default StockService;
