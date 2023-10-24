import { IStockDataSource } from "types";
import WalletService, { InsufficientFunds } from "../wallet/wallet.service";
import { PrismaClient, Prisma } from "@prisma/client";

class StockService {
  constructor(
    private stockAPIClient: IStockDataSource,
    private walletClient: WalletService,
    private portfolioCollection: Prisma.PortfolioDelegate
  ) {}

  async getStockQuote(symbol: string) {
    return await this.stockAPIClient.getStockQuote(symbol);
  }

  async purchaseStock(userId: number, symbol: string, quantity: number) {
    // get current stock quote
    const stockQuote = await this.getStockQuote(symbol);
    // get user's wallet
    const userWallet: any = await this.walletClient.getWalletByUserId(userId);
    if (!stockQuote) throw new Error("Cannot fetch stock quote");
    if (!userWallet)
      throw new Error(
        "Wallet not found. Either User does not exist or User does not have a wallet"
      );
    const total = stockQuote.price * quantity;
    if (userWallet.funds < total)
      throw new Error("Insufficient funds. Cannot purchase stock");

    // subtract amount from wallet
    await this.walletClient.subtractAmount(userId, total);
    // update user's portfolio to reflect purchased stock

    await this.portfolioCollection.update({
      where: {
        investorId: userId,
      },
      data: {
        stocks: {
          upsert: {
            where: {
              stock_portfolio_id: {
                investorId: userId,
                symbol: symbol,
              },
            },
            create: { symbol, quantity, investorId: userId },
            update: {
              quantity: {
                increment: quantity,
              },
            },
          },
        },
      },
    });
  }
  async sellStockPosition() {}
}

export default StockService;
