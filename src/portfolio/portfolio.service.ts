import { Prisma } from "@prisma/client";
import StockService from "../stock/stock.service";
import WalletService from "../wallet/wallet.service";
import { AppError } from "../utils/errors";
// TODO
// !BUGS: adding stock quantity to user's owned stocks though
// ! insufficient funds. The requests sends back a 400, but
// ! the operation of purchasing a stock still works.

class PorfolioService {
  constructor(
    private stockClient: StockService,
    private walletClient: WalletService,
    private portfolioCollection: Prisma.PortfolioDelegate
  ) {}
  async addStockInvestment(userId: number, symbol: string, quantity: number) {
    const stockDBRef = await this.stockClient.getStockDBRef({ symbol });
    if (stockDBRef != null && stockDBRef.id) {
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
                  symbolId: stockDBRef.id,
                },
              },
              create: {
                quantity,
                investorId: userId,
                symbol: {
                  connectOrCreate: {
                    where: {
                      symbol: symbol,
                    },
                    create: {
                      symbol: symbol,
                    },
                  },
                },
              },
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
  }
  async reduceStockInvestmentQuantity(
    userId: number,
    symbol: string,
    quantity: number
  ) {
    const stockDBRef = await this.stockClient.getStockDBRef({ symbol });
    if (stockDBRef != null && stockDBRef.id) {
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
                  symbolId: stockDBRef.id,
                },
              },
              data: {
                quantity: {
                  decrement: quantity,
                },
              },
            },
          },
        },
      });
    }
  }
  async removeStockInvestment(userId: number, symbol: string) {
    const stockDBRef = await this.stockClient.getStockDBRef({ symbol });
    if (stockDBRef != null && stockDBRef.id) {
      await this.portfolioCollection.update({
        where: {
          investorId: userId,
        },
        data: {
          stocks: {
            delete: {
              stock_portfolio_id: {
                investorId: userId,
                symbolId: stockDBRef.id,
              },
            },
          },
        },
      });
    }
  }
  async hasInvestment(userId: string, stock: string): Promise<boolean> {
    throw new Error("not yet implemented");
  }
  async calculateTotalGains(userId: number) {
    throw new Error("not yet implemented");
  }
  async getPortfolio(userId: number) {
    return await this.portfolioCollection.findFirst({
      where: {
        investorId: userId,
      },
      include: {
        stocks: true,
        investor: true,
      },
    });
  }
  async findStockFromPortfolio(userId: number, symbol: string) {
    const res = await this.portfolioCollection.findUnique({
      where: {
        investorId: userId,
      },
      select: {
        stocks: {
          include: {
            symbol: true,
          },
        },
      },
    });

    const stocks = res?.stocks;

    if (!stocks) throw new AppError("User does not own stock", 400);

    const stockToSell = stocks.find(
      (stock: any) => stock.symbol.symbol === symbol
    );
    return stockToSell;
  }
}

export default PorfolioService;
