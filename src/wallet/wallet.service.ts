import { Prisma } from "@prisma/client";
import { Optional } from "types";

export class InsufficientFunds extends Error {
  constructor(message: string = "Insufficient funds") {
    super(message);
  }
}

type WalletType = {
  id: number;
  funds: number;
  ownerId: number;
};

type WalletOptionalId = Optional<WalletType, "id">;

class WalletService {
  constructor(private walletCollection: Prisma.WalletDelegate) {}

  async addAmount(userId: number, amount: number) {
    const userWallet = await this.getWalletByUserId(userId);
    const result = userWallet.funds + amount;
    await this.walletCollection.update({
      where: {
        ownerId: userId,
      },
      data: {
        funds: result,
      },
    });
  }

  async subtractAmount(userId: number, amount: number) {
    const userWallet = await this.getWalletByUserId(userId);
    const result = userWallet.funds - amount;
    await this.walletCollection.update({
      where: {
        ownerId: userId,
      },
      data: {
        funds: result,
      },
    });
  }

  async getWalletByUserId(userId: number): Promise<WalletType> {
    const wallet = this.walletCollection.findFirst({
      where: {
        ownerId: userId,
      },
    });
    return wallet as any as WalletType;
  }
}

export default WalletService;
