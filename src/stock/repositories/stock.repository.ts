// import prisma from "src/libs/prisma";
import { Dependencies } from "../../infrastructure/di";
import { IStockRepository } from "../interfaces/IStockRepository";
import Stock from "../stock";

class StockRepository implements IStockRepository {
  private db: Dependencies["db"];

  constructor({ db }: Pick<Dependencies, "db">) {
    this.db = db;
  }

  async create({ stock }: { stock: Stock }): Promise<{ id: number }> {
    const { id } = await this.db.stock.create({
      data: {
        symbol: stock.symbol,
      },
    });
    return { id };
  }

  async delete({ id }: { id: number }): Promise<void> {
    await this.db.stock.delete({ where: { id } });
  }

  async getById({ id }: { id: number }): Promise<Stock | null> {
    const stock = await this.db.stock.findFirst({ where: { id } });
    if (!stock) return null;
    return this.toEntity(stock);
  }

  async getByStockSymbol({
    symbol,
  }: {
    symbol: string;
  }): Promise<Stock | null> {
    const stock = await this.db.stock.findFirst({
      where: { symbol },
    });
    if (!stock) return null;
    return this.toEntity(stock);
  }

  async upsert({ stock }: { stock: Stock }): Promise<{ id: number }> {
    const res = await this.db.stock.upsert({
      where: {
        symbol: stock.symbol,
      },
      create: {
        symbol: stock.symbol,
      },
      update: {
        symbol: stock.symbol,
      },
    });
    return res;
  }

  private toEntity(stock: any) {
    return new Stock({
      id: stock.id,
      symbol: stock.symbol,
    });
  }

  async findOrCreate({ symbol }: { symbol: string }): Promise<Stock | null> {
    const res = await this.db.stock.upsert({
      where: { symbol },
      create: { symbol: symbol },
      update: {},
    });
    return res;
  }
}

export default StockRepository;
