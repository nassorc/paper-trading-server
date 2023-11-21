import { PrismaClient } from "@prisma/client";
import { RedisCommander } from "ioredis";
import StockMarketAPI from "../stock/api";

import StockRepository from "..//stock/stock.repository";

export interface Dependencies {
  db: PrismaClient;
  cache: RedisCommander;
  stockMarketAPI: StockMarketAPI;
  stockRepository: StockRepository;
}
