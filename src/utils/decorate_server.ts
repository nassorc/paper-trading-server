// SCHEMAS
import { userSchemas } from "../user/user.schema";
import { stockSchemas } from "../stock/stock.schema";
import { walletSchemas } from "../wallet/wallet.schema";

// SERVICES
import UserService from "../user/user.service";
import StockDataSourceAPI from "../stock/api";
import StockService from "../stock/stock.service";
import WalletService from "../wallet/wallet.service";
import StockDataSourceAPI from "../stock/data_source";
import WatchlistService from "../watchlist/watchlist.service";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  export interface FastifyInstance {
    userService: UserService;
    stockService: StockService;
    walletService: WalletService;
    watchlistService: WatchlistService;
    requireUser: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export async function decorateFastifyIntance(app: FastifyInstance) {
  // This function will decorate the global instance of fastify
  // SCHEMAS
  for (const schema of [...userSchemas, ...stockSchemas, ...walletSchemas]) {
    app.addSchema(schema);
  }
  // SERVICES
  const userCollection = await app.db.user;
  const userService = new UserService(userCollection);
  app.decorate("userService", userService);

  const walletCollection = await app.db.wallet;
  const walletService = new WalletService(walletCollection);
  app.decorate("walletService", walletService);

  const stockCollection = await app.db.purchasedStock;
  const portfolioCollection = await app.db.portfolio;
  const stockAPI = new StockDataSourceAPI();
  const stockService = new StockService(
    stockAPI,
    walletService,
    portfolioCollection,
    app.redis
  );
  app.decorate("stockService", stockService);

  const watchlistCollection = await app.db.watchlist;
  const watchlistService = new WatchlistService(watchlistCollection);
  app.decorate("watchlistService", watchlistService);
}
