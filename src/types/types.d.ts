export interface StockQuoteType {
  symbol: string;
  price: number;
  volume: number;
}
export interface IStockDataSource {
  getStockQuote: (symbol: string) => Promise<StockQuoteType>;
}

export interface IObserver {
  update(subject: ISubject, data: any): void;
}

export interface ISubject {
  attach(o: IObserver): void;
  detach(o: IObserver): void;
  notify(data: any): void;
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type NextFn = () => void;

export enum REALTIME_STOCK_EVENTS {
  Price,
}
