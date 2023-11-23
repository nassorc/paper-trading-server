import Wallet from "./wallet";

export interface IWalletRepository {
  create(params: { wallet: Wallet }): Promise<{ id: number }>;
  update(params: { wallet: Wallet }): Promise<any>;
  delete(params: { id: number }): Promise<void>;
  getById(params: { id: number }): Promise<Wallet | null>;
  getByUserId(params: { id: number }): Promise<Wallet | null>;
}
