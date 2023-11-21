import WalletService from "../wallet/wallet.service";
import StockService from "./stock.service";
import PorfolioService from "../portfolio/portfolio.service";
import TransactionService, {
  OrderType,
} from "../transaction/transaction.service";
import { AppError } from "../utils/errors";

export interface StockOrderType {
  userId: number;
  symbol: string;
  quantity: number;
}

interface ConstructorType {
  stockClient: StockService;
  walletClient: WalletService;
  portfolioClient: PorfolioService;
  transactionClient: TransactionService;
}

class StockOrderService {
  stockClient: StockService;
  walletClient: WalletService;
  portfolioClient: PorfolioService;
  transactionClient: TransactionService;

  constructor({
    stockClient,
    walletClient,
    portfolioClient,
    transactionClient,
  }: ConstructorType) {
    this.stockClient = stockClient;
    this.walletClient = walletClient;
    this.portfolioClient = portfolioClient;
    this.transactionClient = transactionClient;
  }
  async createBuyOrder(order: StockOrderType) {
    if (!this.parseOrder(order)) {
      throw new Error("Cannot parse object as Order");
    }
    const { userId, symbol, quantity } = order;
    const stockQuote = await this.stockClient.getStockQuote({ symbol });
    const total = stockQuote.price * quantity;
    await this.walletClient.check(userId, total);
    // await this.stockClient.getDBStockRef(symbol);
    await this.portfolioClient.addStockInvestment(userId, symbol, quantity);
    await this.walletClient.subtractAmount(userId, total);
    await this.transactionClient.createTransaction(OrderType.PURCHASE, {
      userId: userId,
      symbol: symbol,
      amount: total,
      quantity: quantity,
    });
    // throw new Error("error");
  }
  async createSellOrder(order: StockOrderType) {
    if (!this.parseOrder(order)) {
      throw new Error("Cannot parse object as Order");
    }
    const { userId, symbol, quantity } = order;
    const stockQuote = await this.stockClient.getStockQuote({ symbol });
    const stockToSell = await this.portfolioClient.findStockFromPortfolio(
      userId,
      symbol
    );
    const total = stockQuote.price * quantity;
    // await this.walletClient.check(userId, total);
    if (!stockToSell || stockToSell.quantity < quantity) {
      throw new AppError("Could not process sell order", 400);
    }
    if (stockToSell.quantity > quantity) {
      // remove stock from portfolio
      // await this.decrStockQuantity(userId, stockDBRef.id, quantity);
      await this.portfolioClient.reduceStockInvestmentQuantity(
        userId,
        symbol,
        quantity
      );
    } else if (quantity - stockToSell.quantity === 0) {
      // subtract quantity from number of owned positions
      // await this.deleteStockFromPortfolio(userId, stockDBRef.id);
      await this.portfolioClient.removeStockInvestment(userId, symbol);
    }
    await this.walletClient.addAmount(userId, total);
    await this.transactionClient.createTransaction(OrderType.SELL, {
      userId: userId,
      symbol: symbol,
      amount: total,
      quantity: quantity,
    });
  }
  private parseOrder(order: StockOrderType): order is StockOrderType {
    return "userId" in order && "symbol" in order && "quantity" in order;
  }
}
export default StockOrderService;
