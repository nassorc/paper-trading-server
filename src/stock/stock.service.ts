import { IStockDataSource } from "types";
import Wallet, { InsufficientFunds } from "../wallet/wallet.service";

class StockService {
  constructor(private stockCollection: IStockDataSource) {
    this.stockCollection = stockCollection;
  }
  async getStockQuote(symbol: string) {
    return await this.stockCollection.getStockQuote(symbol);
  }
  async purchaseStock(
    symbol: string,
    quantity: number,
    wallet: InstanceType<typeof Wallet>
  ) {
    const stockQuote = await this.getStockQuote(symbol);
    // if wallet has sufficient funds

    try {
      const totalPrice = stockQuote.price * quantity;
      wallet.subtractAmount(totalPrice);
    } catch (err) {
      throw err;
    }
    // else don't allow transaction
  }
}

export default StockService;
