import { PrismaClient } from "@prisma/client";
import { RedisCommander } from "ioredis";
import StockMarketAPI from "../stock/api";

import StockRepository from "../stock/repositories/stock.repository";
import UserRepository from "../user/user.repository";
import WalletRepository from "../wallet/wallet.repository";
import StockWebSocketClient from "./stockWebSocketClient";

export interface Dependencies {
  db: PrismaClient;
  cache: RedisCommander;
  stockMarketAPI: StockMarketAPI;
  stockRepository: StockRepository;
  userRepository: UserRepository;
  walletRepository: WalletRepository;
  stockWebsocketClient: StockWebSocketClient;
}
