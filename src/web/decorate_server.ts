import { FastifyInstance } from "fastify";
// SCHEMAS
import { userSchemas } from "../user/user.schema";
import { stockSchemas } from "../stock/stock.schema";
import { walletSchemas } from "../wallet/wallet.schema";

// SERVICES
import UserService from "../user/user.service";
import StockMarketAPI from "../stock/api";
import StockService from "../stock/stock.service";
import StockOrderService from "../stock/stock_order.service";
import WalletService from "../wallet/wallet.service";
import WatchlistService from "../watchlist/watchlist.service";
import PorfolioService from "../portfolio/portfolio.service";
import TransactionService from "../transaction/transaction.service";

import StockRepository from "../stock/repositories/stock.repository";
import UserRepository from "../user/user.repository";
import WalletRepository from "../wallet/wallet.repository";

declare module "fastify" {
  export interface FastifyInstance {
    userService: UserService;
    stockService: StockService;
    walletService: WalletService;
    watchlistService: WatchlistService;
    portfolioService: PorfolioService;
    transactionService: TransactionService;
    stockOrderService: StockOrderService;
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
  const userRepository = new UserRepository({ db: app.db });
  const userService = new UserService({ userRepository });
  app.decorate("userService", userService);

  const walletCollection = await app.db.wallet;
  const walletRepository = new WalletRepository({ db: app.db });
  const walletService = new WalletService({ walletRepository });
  app.decorate("walletService", walletService);

  const watchlistCollection = await app.db.watchlist;
  const watchlistService = new WatchlistService(watchlistCollection);
  app.decorate("watchlistService", watchlistService);

  const stockCollection = await app.db.stock;
  const portfolioCollection = await app.db.portfolio;

  const stockAPI = new StockMarketAPI();
  const stockService = new StockService({
    stockMarketAPI: stockAPI,
    stockRepository: new StockRepository({ db: app.db }),
    cache: app.redis,
  });
  app.decorate("stockService", stockService);

  const portfolioService = new PorfolioService(
    stockService,
    walletService,
    portfolioCollection
  );
  app.decorate("portfolioService", portfolioService);

  const transactionCollection = await app.db.stockTransaction;
  const transactionService = new TransactionService(
    stockService,
    transactionCollection
  );
  app.decorate("transactionService", transactionService);

  const stockOrderService = new StockOrderService({
    stockClient: stockService,
    portfolioClient: portfolioService,
    transactionClient: transactionService,
    walletClient: walletService,
  });
  app.decorate("stockOrderService", stockOrderService);
}
