// function MakeWallet({ currency }: any) {
//   if (!currency) throw new Error("Missing dependencies to construct a wallet");
//   return function ({ amount }: any) {
//     return Object.freeze({
//       deposit() {
//         return amount;
//       },
//     });
//   };
// }

// const makeWallet = MakeWallet({ currency: "curency" });
// const wallet = makeWallet({amount: 100});
// wallet.deposit()

class Wallet {
  public id?: number;
  public ownerId?: number;
  public funds: number;
  public totalAmount: number;

  constructor({
    id,
    ownerId,
    funds,
    totalAmount,
  }: {
    id?: number;
    ownerId?: number;
    funds: number;
    totalAmount: number;
  }) {
    this.id = id;
    this.ownerId = ownerId;
    this.funds = funds;
    this.totalAmount = totalAmount;
  }
  deposit({ amount }: { amount: number }) {
    this.funds += amount;
  }
  withdraw({ amount }: { amount: number }) {
    this.funds -= amount;
  }
}
export default Wallet;
