import { Watchlist as WatchlistModel } from "@prisma/client";
import { Dependencies } from "../infrastructure/di";
import { IWatchlistRepository } from "./IWatchlistRepository";
import Watchlist from "./watchlist";
import { symbol } from "zod";

class WatchlistRepository implements IWatchlistRepository {
  private db: Dependencies["db"];
  constructor({ db }: Pick<Dependencies, "db">) {
    this.db = db;
  }
  async create(params: any): Promise<{ id: number }> {
    const newWatchlist = await this.db.watchlist.create({
      data: {
        symbols: params.watchlist.symbols,
        investor: {
          connect: {
            id: params.id,
          },
        },
      },
    });
    return { id: newWatchlist.id };
  }
  async delete({ id }: { id: number }): Promise<void> {
    await this.db.watchlist.delete({
      where: { id },
    });
  }
  async update({
    watchlist,
  }: {
    watchlist: Watchlist;
  }): Promise<Watchlist | null> {
    const updatedWatchlist = await this.db.watchlist.update({
      where: {
        id: watchlist.id,
      },
      data: {
        symbols: {
          // connect: watchlist.symbols.map(symbol => ({symbol: symbol})) || []
          connectOrCreate:
            watchlist.symbols.map((symbol) => ({
              where: { symbol: symbol },
              create: { symbol: symbol },
            })) || [],
        },
      },
      include: {
        symbols: true,
      },
    });
    if (!updatedWatchlist) return null;
    return this.toEntity({ watchlist: updatedWatchlist });
  }

  async getById({ id }: { id: number }): Promise<Watchlist | null> {
    const wl = await this.db.watchlist.findFirst({
      where: { id },
      include: { symbols: true },
    });
    if (!wl) return null;
    return this.toEntity({ watchlist: wl });
  }
  async getByUserId({ id }: { id: number }): Promise<Watchlist | null> {
    const wl = await this.db.watchlist.findFirst({
      where: { investorId: id },
      include: { symbols: true },
    });
    if (!wl) return null;
    return this.toEntity({ watchlist: wl });
  }
  toEntity({
    watchlist,
  }: {
    watchlist: {
      id: number;
      userId?: number;
      symbols: { symbol: string; id: number }[];
    };
  }) {
    return new Watchlist({
      id: watchlist.id,
      symbols: watchlist.symbols.map((s) => s.symbol),
    });
  }
}

export default WatchlistRepository;
