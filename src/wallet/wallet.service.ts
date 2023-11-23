import {
  AppError,
  InsufficientFunds,
  NotFound,
  RECORD_NOT_FOUND_CODE,
} from "../utils/errors";
import { Dependencies } from "../infrastructure/di";
import Wallet from "./wallet";

class WalletService {
  private walletRepository: Dependencies["walletRepository"];
  constructor({ walletRepository }: Pick<Dependencies, "walletRepository">) {
    this.walletRepository = walletRepository;
  }

  async addAmount(userId: number, amount: number) {
    try {
      const wallet = await this.walletRepository.getByUserId({ id: userId });
      if (!wallet) {
        throw new NotFound("WalletNotFound");
      }

      wallet.deposit({ amount });
      wallet.totalAmount += amount;
      return await this.walletRepository.update({ wallet });
    } catch (err: any | { code: string }) {
      if (err.code == RECORD_NOT_FOUND_CODE) {
        throw new NotFound("WalletNotFound");
      }
      throw err;
    }
  }

  async subtractAmount(userId: number, amount: number) {
    try {
      const wallet = await this.walletRepository.getByUserId({ id: userId });
      if (!wallet) {
        throw new NotFound("WalletNotFound");
      }

      wallet.withdraw({ amount });
      wallet.totalAmount -= amount;

      if (!wallet) throw new AppError("Cannot find user's wallet", 400);
      if (wallet.funds < 0) {
        throw new InsufficientFunds();
      }
      await this.walletRepository.update({ wallet });
      return { fund: wallet.funds };
    } catch (err: any) {
      if (err.code == RECORD_NOT_FOUND_CODE) {
        throw new NotFound("WalletNotFound");
      }
      throw err;
    }
  }

  async getWalletByUserId(userId: number): Promise<Wallet> {
    const wallet = await this.walletRepository.getByUserId({ id: userId });
    if (!wallet) {
      throw new NotFound("WalletNotFound");
    }
    return wallet as any as Wallet;
  }

  async updateTotalAmount(userId: number, amount: number) {
    try {
      const wallet = await this.walletRepository.getByUserId({ id: userId });
      if (!wallet) {
        throw new NotFound("WalletNotFound");
      }
      wallet.totalAmount += amount;

      await this.walletRepository.update({ wallet });
    } catch (err: any) {
      if (err.code == RECORD_NOT_FOUND_CODE) {
        throw new NotFound("WalletNotFound");
      }
      throw err;
    }
  }

  async check(userId: number, amount: number) {
    const wallet = await this.walletRepository.getByUserId({ id: userId });
    if (!wallet) {
      throw new NotFound("WalletNotFound");
    }
    return amount <= wallet.funds;
  }
}

export default WalletService;
