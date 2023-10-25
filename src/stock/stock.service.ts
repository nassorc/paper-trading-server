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
  async sellStockPosition(userId: number, symbol: string, quantity: number) {
    // get current stock quote
    const stockQuote = await this.getStockQuote(symbol);
    const totalSellPrice = stockQuote.price * quantity;
    const stockToSell = await this.findStockFromPortfolio(userId, symbol);

    // check if user sell has the quantity to sell
    if (!stockToSell || stockToSell.quantity < quantity) {
      throw new InsufficientFunds();
    }
    if (stockToSell.quantity > quantity) {
      // remove stock from portfolio
      await this.updateStockQuantityFromPortfolio(
        userId,
        symbol,
        stockToSell.quantity - quantity
      );
    } else if (quantity - stockToSell.quantity === 0) {
      // subtract quantity from number of owned positions
      await this.deleteStockFromPortfolio(userId, symbol);
    }
    // add amount to wallet
    await this.walletClient.addAmount(userId, totalSellPrice);
  }
  private async deleteStockFromPortfolio(userId: number, symbol: string) {
    await this.portfolioCollection.update({
      where: {
        investorId: userId,
      },
      data: {
        stocks: {
          delete: {
            stock_portfolio_id: {
              investorId: userId,
              symbol: symbol,
            },
          },
        },
      },
    });
  }
  private async updateStockQuantityFromPortfolio(
    userId: number,
    symbol: string,
    newQuantity: number
  ) {
    await this.portfolioCollection.update({
      where: {
        investorId: userId,
      },
      data: {
        stocks: {
          update: {
            where: {
              stock_portfolio_id: {
                investorId: userId,
                symbol: symbol,
              },
            },
            data: {
              quantity: newQuantity,
            },
          },
        },
      },
    });
  }
  private async findStockFromPortfolio(userId: number, symbol: string) {
    const res = await this.portfolioCollection.findUnique({
      where: {
        investorId: userId,
      },
      select: {
        stocks: true,
      },
    });

    const stocks = res?.stocks;

    if (!stocks) throw new AppError("User does not own stock", 400);

    const stockToSell = stocks.find((stock: any) => stock.symbol === symbol);
    return stockToSell;
  }
}

export default StockService;
