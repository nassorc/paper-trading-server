import { IStockDataSource } from "types";
import WalletService from "../wallet/wallet.service";
import { Prisma } from "@prisma/client";
import { AppError, InsufficientFunds } from "../utils/errors";

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
    const totalPrice = stockQuote.price * quantity;
    if (userWallet.funds < totalPrice) throw new InsufficientFunds();

    // subtract amount from wallet
    await this.walletClient.subtractAmount(userId, totalPrice);
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
