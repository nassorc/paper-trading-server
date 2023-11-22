import axios from "axios";
import "dotenv/config";
import { IStockAPI } from "./interfaces/IStockAPI";
import { QuoteType } from "./types";

class StockMarketAPI implements IStockAPI {
  // https://api.twelvedata.com/price?symbol=AAPL&apikey=your_api_key
  private url = "https://financialmodelingprep.com";
  private key = String(process.env.STOCK_API_KEY || "");
  constructor() {}
  connectToWebSockets(): void {
    throw new Error("Method not implemented.");
  }
  async getStockQuote({ symbol }: { symbol: string }) {
    const stockQuote: { data: [QuoteType] } = await axios.get(
      `${this.url}/api/v3/quote/${symbol}?apikey=${this.key}`
    );
    return stockQuote.data[0];
  }
  async listStockQuotes({
    symbol,
    limit,
    offset,
  }: {
    symbol: string;
    limit: number;
    offset: number;
  }) {
    const stockQuote: { data: [QuoteType] } = await axios.get(
      `${this.url}/api/v3/quote/${symbol}?apikey=${process.env.STOCK_API_KEY}`
    );
    return { stocks: stockQuote.data };
  }
}

export default StockMarketAPI;
