class Stock {
  public symbol: string;
  public id?: number;
  constructor({ id, symbol }: { id?: number; symbol: string }) {
    if (id) {
      this.id = id;
    }
    this.symbol = symbol.toUpperCase();
  }
}
export default Stock;
