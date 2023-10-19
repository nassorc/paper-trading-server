import axios from "axios";
import { IStockDataSource, StockQuoteType } from "types";

class StockDataSourceAPI implements IStockDataSource {
  constructor() {}
  async getStockQuote(symbol: string) {
    const stockQuote: { data: [StockQuoteType] } = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${process.env.STOCK_API_KEY}`
    );
    return Promise.resolve(stockQuote.data[0]);
  }
}

export default StockDataSourceAPI;
