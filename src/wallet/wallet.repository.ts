import { Wallet as WalletModel } from "@prisma/client";
import { Dependencies } from "../infrastructure/di";
import { IWalletRepository } from "./IWalletRepository";
import Wallet from "./wallet";

class WalletRepository implements IWalletRepository {
  private db: Dependencies["db"];
  constructor({ db }: Pick<Dependencies, "db">) {
    this.db = db;
  }

  async create({
    wallet,
    userId,
  }: {
    wallet: Wallet;
    userId: number;
  }): Promise<{ id: number }> {
    const { id } = await this.db.wallet.create({
      data: {
        funds: wallet.funds,
        totalAmount: wallet.totalAmount,
        owner: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return { id };
  }

  async update({ wallet }: { wallet: Wallet }): Promise<any> {
    if (!wallet.id) {
      throw new Error(
        "WalletRepository update operation failed. Missing wallet id field"
      );
    }

    const walletRecord = await this.db.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        funds: wallet.funds,
        totalAmount: wallet.totalAmount,
      },
    });

    return this.toEntity({ wallet: walletRecord });
  }

  async delete({ id }: { id: number }): Promise<void> {
    await this.db.wallet.delete({
      where: { id: id },
    });
  }

  async getById({ id }: { id: number }): Promise<Wallet | null> {
    const wallet = await this.db.wallet.findFirst({
      where: { id },
    });
    if (!wallet) return null;
    return this.toEntity({ wallet });
  }

  async getByUserId({ id }: { id: number }): Promise<Wallet | null> {
    const wallet = await this.db.wallet.findFirst({
      where: { ownerId: id },
    });
    if (!wallet) return null;
    return this.toEntity({ wallet });
  }

  private toEntity({ wallet }: { wallet: WalletModel }) {
    return new Wallet({
      id: wallet.id,
      ownerId: wallet.ownerId,
      funds: wallet.funds,
      totalAmount: wallet.totalAmount,
    });
  }
}

export default WalletRepository;
