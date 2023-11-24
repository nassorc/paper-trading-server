class Watchlist {
  public id: number;
  public symbols: string[];
  constructor({ id, symbols }: { id: number; symbols?: string[] }) {
    if (!symbols) {
      this.symbols = [];
    } else {
      this.symbols = symbols;
    }
    this.id = id;
  }
  addToWatchlist({ symbol }: { symbol: string }) {
    this.symbols.push(symbol);
  }
  removeFromWatchlist({ symbol }: { symbol: string }) {
    this.symbols.filter((ws) => ws != symbol);
  }
}
export default Watchlist;
