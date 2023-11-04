import { IStockDataSource } from "types";
import WalletService from "../wallet/wallet.service";
import { Prisma } from "@prisma/client";
import { AppError, InsufficientFunds } from "../utils/errors";
import { RedisCommander } from "ioredis";

// TODO! use prisma $transactions to be able to rollback/cancel database commits if any
// ! operation in a sequence of db calls fails.
interface StockServiceConstructorType {
  stockAPIClient: IStockDataSource;
  walletClient: WalletService;
  portfolioCollection: Prisma.PortfolioDelegate;
  stockCollection: Prisma.StockDelegate;
  cache: RedisCommander;
}

class StockService {
  stockAPIClient: IStockDataSource;
  walletClient: WalletService;
  portfolioCollection: Prisma.PortfolioDelegate;
  stockCollection: Prisma.StockDelegate;
  cache: RedisCommander;

  constructor({
    stockAPIClient,
    walletClient,
    portfolioCollection,
    stockCollection,
    cache,
  }: StockServiceConstructorType) {
    if (
      !stockAPIClient ||
      !walletClient ||
      !portfolioCollection ||
      !stockCollection ||
      !cache
    ) {
      throw new Error(
        "Cannot instantiate StockService with missing dependencies"
      );
    }
    this.stockAPIClient = stockAPIClient;
    this.walletClient = walletClient;
    this.portfolioCollection = portfolioCollection;
    this.stockCollection = stockCollection;
    this.cache = cache;
  }

  async getStockQuote(symbol: string) {
    return await this.stockAPIClient.getStockQuote(symbol);
  }
  async getCachedOrFetchStockQuote(symbol: string) {
    const cacheKey = `quote:${symbol}`;
    const existsInCache = await this.cache.exists(cacheKey);
    // CACHE HIT
    if (existsInCache) {
      const stockQuote = await this.cache.hgetall(cacheKey);
      return stockQuote;
    }
    // CACHE MISS
    const data = await this.getStockQuote(symbol);
    await this.cache.hset(cacheKey, data);
    return data;
  }
}

export default StockService;
