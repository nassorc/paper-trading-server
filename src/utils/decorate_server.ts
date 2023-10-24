// SCHEMAS
import { userSchemas } from "../user/user.schema";
import { stockSchemas } from "../stock/stock.schema";
import { walletSchemas } from "../wallet/wallet.schema";

// SERVICES
import UserService from "../user/user.service";
import StockService from "../stock/stock.service";
import WalletService from "../wallet/wallet.service";
import StockDataSourceAPI from "../stock/data_source";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  export interface FastifyInstance {
    userService: UserService;
    stockService: StockService;
    walletService: WalletService;
    requireUser: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export async function decorateFastifyIntance(fastify: FastifyInstance) {
  // This function will decorate the global instance of fastify
  // SCHEMAS
  for (const schema of [...userSchemas, ...stockSchemas, ...walletSchemas]) {
    fastify.addSchema(schema);
  }
  // SERVICES
  const userCollection = await fastify.db.user;
  const userService = new UserService(userCollection);
  fastify.decorate("userService", userService);

  const walletCollection = await fastify.db.wallet;
  const walletService = new WalletService(walletCollection);
  fastify.decorate("walletService", walletService);

  const stockCollection = await fastify.db.purchasedStock;
  const portfolioCollection = await fastify.db.portfolio;
  const stockAPI = new StockDataSourceAPI();
  const stockService = new StockService(
    stockAPI,
    walletService,
    portfolioCollection
  );
  fastify.decorate("stockService", stockService);
}
