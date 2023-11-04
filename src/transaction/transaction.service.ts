import { Prisma } from "@prisma/client";
import PorfolioService from "../portfolio/portfolio.service";
import StockService from "../stock/stock.service";
import { StockOrderType } from "../stock/stock_order.service";

enum OrderType {
  BUY,
  SELL,
}

class TransactionService {
  constructor(
    private StockClient: StockService,
    // private PortfolioClient: PorfolioService,
    private TransactionCollection: Prisma.StockTransactionDelegate
  ) {}
  async createTransaction(
    type: OrderType,
    order: Omit<StockOrderType, "symbol"> & { stockId: number }
  ) {}
  async getAllUserTransactions() {}
  async findUserTransaction() {}
}

export default TransactionService;
