export class InsufficientFunds extends Error {
  constructor(message: string = "Insufficient funds") {
    super(message);
  }
}

class Wallet {
  constructor(private funds: number) {}
  isEmpty(): boolean {
    return this.funds == 0;
  }
  hasSufficientFunds(amount: number): boolean {
    return amount >= this.funds;
  }
  subtractAmount(amount: number) {
    if (!this.hasSufficientFunds(amount)) {
      throw new InsufficientFunds();
    } else {
      this.funds -= amount;
    }
  }
  addAmount(amount: number) {
    this.funds += amount;
  }
}

export default Wallet;
