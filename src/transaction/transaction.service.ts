import { Prisma } from "@prisma/client";
import StockService from "../stock/stock.service";
import { StockOrderType } from "../stock/stock_order.service";

export enum OrderType {
  PURCHASE = "PURCHASE",
  SELL = "SELL",
}

class TransactionService {
  constructor(
    private StockClient: StockService,
    private transactionCollection: Prisma.StockTransactionDelegate
  ) {}
  async createTransaction(
    type: OrderType,
    order: StockOrderType & { amount: number }
  ) {
    const { quantity, symbol, userId, amount: orderAmount } = order;
    await this.transactionCollection.create({
      data: {
        orderAmount,
        quantity,
        type: type,
        userId: userId,
        stock: {
          connect: {
            symbol: symbol,
          },
        },
      },
    });
  }
  // TODO? pagination
  async getAllUserTransactions(userId: number) {
    return this.transactionCollection.findMany({
      where: {
        userId,
      },
    });
  }
  async findUserTransaction(transactionId: number) {
    return this.transactionCollection.findFirst({
      where: {
        id: transactionId,
      },
    });
  }
}

export default TransactionService;
