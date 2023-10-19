export interface StockQuoteType {
  symbol: string;
  price: number;
  volume: number;
}
export interface IStockDataSource {
  getStockQuote: (symbol: string) => Promise<StockQuoteType>;
}
