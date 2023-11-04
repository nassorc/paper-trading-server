import { Prisma } from "@prisma/client";
import {
  AppError,
  InsufficientFunds,
  NotFound,
  RECORD_NOT_FOUND_CODE,
} from "../utils/errors";
import { Optional } from "types";

type WalletType = {
  id: number;
  funds: number;
  totalAmount: number;
  ownerId: number;
};

type WalletOptionalId = Optional<WalletType, "id">;

class WalletService {
  constructor(private walletCollection: Prisma.WalletDelegate) {}

  async addAmount(userId: number, amount: number) {
    try {
      const userWallet = await this.getWalletByUserId(userId);
      const updatedFunds = userWallet.funds + amount;

      await this.walletCollection.update({
        where: {
          ownerId: userId,
        },
        data: {
          funds: updatedFunds,
        },
      });
    } catch (err: any | { code: string }) {
      if (err.code == RECORD_NOT_FOUND_CODE) {
        throw new NotFound("WalletNotFound");
      }
      throw err;
    }
  }

  async subtractAmount(userId: number, amount: number) {
    try {
      const userWallet = await this.getWalletByUserId(userId);
      const updatedFunds = userWallet.funds - amount;
      if (updatedFunds < 0) {
        throw new InsufficientFunds();
      }
      await this.walletCollection.update({
        where: {
          ownerId: userId,
        },
        data: {
          funds: updatedFunds,
        },
      });
    } catch (err: any) {
      if (err.code == RECORD_NOT_FOUND_CODE) {
        throw new NotFound("WalletNotFound");
      }
      throw err;
    }
  }

  async getWalletByUserId(userId: number): Promise<WalletType> {
    const wallet = await this.walletCollection.findFirst({
      where: {
        ownerId: userId,
      },
    });
    if (!wallet) throw new NotFound();
    return wallet as any as WalletType;
  }

  async updateTotalAmount(userId: number, amount: number) {
    try {
      const userWallet = await this.getWalletByUserId(userId);
      const newTotal = userWallet.totalAmount + amount;
      await this.walletCollection.update({
        where: {
          ownerId: userId,
        },
        data: {
          totalAmount: newTotal,
        },
      });
    } catch (err: any) {
      if (err.code == RECORD_NOT_FOUND_CODE) {
        throw new NotFound("WalletNotFound");
      }
      throw err;
    }
  }

  async check(userId: number, amount: number) {
    const wallet = await this.walletCollection.findFirst({
      where: {
        ownerId: userId,
      },
    });
    if (!wallet) {
      throw new AppError("Could not find user wallet", 400);
    }
    return amount <= wallet?.funds;
  }
}

export default WalletService;
