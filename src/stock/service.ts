import { IStockDataSource } from "types";
class StockService {
  constructor(private stockCollection: IStockDataSource) {
    this.stockCollection = stockCollection;
  }
  async getStockQuote(symbol: string) {
    return await this.stockCollection.getStockQuote(symbol);
  }
}

export default StockService;
