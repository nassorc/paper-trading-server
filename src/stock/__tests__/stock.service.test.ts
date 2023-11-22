import WalletService from "../../wallet/wallet.service";
import StockAPI from "../api";
import prisma from "../../libs/prisma";
import Redis from "../../libs/redis";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
import StockService from "../stock.service";

const redis = new Redis();

jest.mock("../libs/prisma");
jest.mock("../libs/redis");
jest.mock("./api");

const mockedRedis = jest.mocked(redis);
const mockedPrisma: DeepMockProxy<typeof prisma> = mockDeep<typeof prisma>();
const data = JSON.stringify({ symbol: "Test", price: 99.9, volume: 1001 });
const stockQuoteOutput = JSON.parse(data);
const cacheKey = `quote:${stockQuoteOutput.symbol}`;

afterAll(() => {
  redis.shutdown();
});
const stockDataAPI = new StockAPI();

const stockServiceConstructor = {
  stockAPIClient: stockDataAPI,
  walletClient: new WalletService(mockedPrisma.wallet),
  portfolioCollection: mockedPrisma.portfolio,
  stockCollection: mockedPrisma.stock,
  cache: mockedRedis,
};
const stockService = new StockService(stockServiceConstructor);

describe("StockService", () => {
  describe("get stock quote", () => {
    describe("given stock symbol is in the cache", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        mockedRedis.exists.mockResolvedValue(1); // CACHE HIT
        mockedRedis.hgetall.mockResolvedValue(stockQuoteOutput);
      });
      it("should return the stock quote", async () => {
        const res = await stockService.getCachedOrFetchStockQuote(
          stockQuoteOutput.symbol
        );
        expect(res).toEqual(stockQuoteOutput);
      });
      it("should call the cache once", async () => {
        await stockService.getCachedOrFetchStockQuote(stockQuoteOutput.symbol);
        expect(mockedRedis.hgetall).toBeCalledTimes(1);
      });
    });
    describe("given stock symbol is NOT in the cache", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        mockedRedis.exists.mockResolvedValue(0); // CACHE MISS
        jest
          .spyOn(stockDataAPI, "getStockQuote")
          .mockResolvedValue(stockQuoteOutput);
      });
      it("should return the stock quote", async () => {
        const res = await stockService.getCachedOrFetchStockQuote(
          stockQuoteOutput.symbol
        );
        expect(res).toEqual(stockQuoteOutput);
      });
      it("should fetch the quote from the api", async () => {
        const res = await stockService.getCachedOrFetchStockQuote(
          stockQuoteOutput.symbol
        );
        expect(stockDataAPI.getStockQuote).toBeCalledTimes(1);
      });
      it("should create a cache entry from the data fetched from the api", async () => {
        const res = await stockService.getCachedOrFetchStockQuote(
          stockQuoteOutput.symbol
        );
        jest.spyOn(mockedRedis, "hset");
        expect(mockedRedis.hset).toBeCalledTimes(1);
      });
    });
  });
  describe("get stock symbol's database entry", () => {
    it("should return the database entry of a stock symbol", async () => {
      const stock = {
        id: 1,
        symbol: "AAPL",
      };
      // @ts-ignore
      mockedPrisma.stock.upsert.mockReturnValue(stock);
      const stockRef = await stockService.getStockDBRef(stock.symbol);
      expect(stockRef).toEqual(stock);
    });
  });
});
