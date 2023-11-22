import Stock from "../stock";

export interface IStockRepository {
  create(params: { stock: Stock }): Promise<{ id: number }>;
  delete(params: { id: number }): Promise<void>;
  getByStockSymbol(params: { symbol: string }): Promise<Stock | null>;
  getById(params: { id: number }): Promise<Stock | null>;
  upsert(params: { stock: Stock }): Promise<{ id: number }>;
  findOrCreate(params: { symbol: string }): Promise<Stock | null>;
}
