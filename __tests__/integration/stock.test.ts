import "dotenv/config";
import axios from "axios";
import { Redis } from "ioredis";
import StockDataSourceAPI from "../../src/stock/api";
import StockService from "../../src/stock/stock.service";
import {
  getStockQuoteHelper,
  prefetchStockQuoteFromAPI,
} from "../helpers/database_utils";
import { createCacheKey } from "../../src/utils/create_cachekey";
import codes from "../../src/utils/reponse_code";
import app from "../helpers/create_server";

// TODO:
// 1. fix brittle tests - implmentation details are known by the tests (e.g. spying on redis and its methods)
// 2. create a file to store a global redis instance. Maybe in the utils of the /src directoy, so both server
//    and tests can use it
// 3. fix issue with the logic with fetching the stock quote and storing it in prefetchStockQuote
//    Issue caused by `jest.mock("axios")` which overwrites the axios library before fetching the
//    data from the api

jest.mock("axios");

let prefetchStockQuote: any;
const testStock = "AAPL";
const stockCacheKey = createCacheKey(testStock);

const redis = new Redis();

beforeAll(async () => {
  prefetchStockQuote = await prefetchStockQuoteFromAPI(testStock);
});

describe("Stock", () => {
  describe("[GET] /stock/quote", () => {
    describe("given valid stock symbol and the data quote is NOT in the cache", () => {
      beforeAll(() => {
        const axiosMocked = axios as jest.Mocked<typeof axios>;
        axiosMocked.get.mockResolvedValue({
          data: [prefetchStockQuote],
        });
      });
      it("should response with a 200 status", async () => {
        const res = await getStockQuoteHelper(testStock);
        expect(res.statusCode).toBe(codes.OK);
      });
      it("should return stock quote", async () => {
        const res = await getStockQuoteHelper(testStock);
        const data = await res.json();
        expect(prefetchStockQuote).toEqual(data);
      });
      it("should make a call to the api once", async () => {
        jest.spyOn(StockService.prototype, "getStockQuote");
        jest.spyOn(StockService.prototype, "getCachedOrFetchStockQuote");
        const res = await getStockQuoteHelper(testStock);
        expect(StockService.prototype.getStockQuote).toBeCalledTimes(1);
        expect(
          StockService.prototype.getCachedOrFetchStockQuote
        ).toBeCalledTimes(1);
      });
      it("should create a cache entry", async () => {
        const res = await getStockQuoteHelper(testStock);
        const data = await redis.hgetall(stockCacheKey);
        expect({ ...data, price: parseFloat(data.price) }).toEqual(
          prefetchStockQuote
        );
      });
      it("should NOT attempt to fetch the data from the cache", async () => {
        const spy = jest.spyOn(app.redis, "hgetall");
        const res = await getStockQuoteHelper(testStock);
        expect(app.redis.hgetall).toBeCalledTimes(0);
      });
    });
    describe("given valid stock symbol and the data quote is in the cache", () => {
      it("should return stock quote", async () => {
        redis.hset(stockCacheKey, prefetchStockQuote);
        const res = await getStockQuoteHelper(testStock);
        const data = await res.json();
        expect(data).toEqual(prefetchStockQuote);
      });
      it("should contain a cache entry of the stock", async () => {
        let entry = await redis.hgetall(stockCacheKey);
        expect(entry).toEqual({});
        const res = await getStockQuoteHelper(testStock);
        entry = await redis.hgetall(stockCacheKey);
        expect({ ...entry, price: parseFloat(entry.price) }).toEqual(
          prefetchStockQuote
        );
      });
      it("should NOT call the stock api", async () => {
        redis.hset(stockCacheKey, prefetchStockQuote);
        jest.spyOn(StockService.prototype, "getStockQuote");
        const res = await getStockQuoteHelper(testStock);
        expect(StockService.prototype.getStockQuote).toBeCalledTimes(0);
      });
    });
  });
});
