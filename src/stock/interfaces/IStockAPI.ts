import { QuoteType } from "../types";
import "dotenv/config";

export interface IStockAPI {
  getStockQuote(params: { symbol: string }): Promise<QuoteType>;
  listStockQuotes(params: {
    symbol: string;
    limit: number;
    offset: number;
  }): Promise<{ stocks: QuoteType[] }>;
  connectToWebSockets(): void;
}
