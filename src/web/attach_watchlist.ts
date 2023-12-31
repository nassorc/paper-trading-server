import { FastifyInstance } from "fastify";
export function attachWatchlist(app: FastifyInstance) {
  return async function (socket: any, next: (err?: any) => void) {
    try {
      const res = await app.watchlistService.getUserWatchlist(socket.user.id);
      const watchlist = res?.symbols || [];

      // socket.watchlist = watchlist.map((stock) => stock.symbol).join(",");
      socket.watchlist = watchlist.map((stock) => stock.symbol);
      next();
    } catch (err: any) {
      next(err);
    }
  };
}
