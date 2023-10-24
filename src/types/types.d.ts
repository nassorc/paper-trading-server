export interface StockQuoteType {
  symbol: string;
  price: number;
  volume: number;
}
export interface IStockDataSource {
  getStockQuote: (symbol: string) => Promise<StockQuoteType>;
}
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type NextFn = () => void;
