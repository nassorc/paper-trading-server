import Watchlist from "./watchlist";

export interface IWatchlistRepository {
  create(params: any): Promise<{ id: number }>;
  update(params: { watchlist: Watchlist }): Promise<Watchlist | null>;
  delete(params: { id: number }): Promise<void>;
  getById(params: { id: number }): Promise<Watchlist | null>;
  getByUserId(params: { id: number }): Promise<Watchlist | null>;
}
