import { Prisma } from "@prisma/client";

export default class WatchlistService {
  constructor(private watchlistCollection: Prisma.WatchlistDelegate) {}
  async getUserWatchlist(userId: number) {
    return await this.watchlistCollection.findFirst({
      where: {
        investorId: userId,
      },
      include: {
        symbols: true,
      },
    });
  }
  async addSymbolToWatchlist(userId: number, symbol: string) {
    await this.watchlistCollection.update({
      where: {
        investorId: userId,
      },
      data: {
        symbols: {
          connectOrCreate: {
            where: {
              symbol: symbol,
            },
            create: {
              symbol: symbol,
            },
          },
        },
      },
    });
  }
}
