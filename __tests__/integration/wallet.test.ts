import {
  addFundsHelper,
  createUserHelper,
  loginUserHelper,
} from "../helpers/database_utils";
import codes from "../../src/utils/reponse_code";
import prisma from "../../src/libs/prisma";
import WalletService from "../../src/wallet/wallet.service";
import resetDb from "../helpers/reset_db";

const userPayload = {
  username: "test-user",
  password: "test-user-password",
};
const testAmounts = [100.99];

// This function creates a user in the database, and authenticates the user
async function addFundsPipeline(credentials?: any, amount?: number) {
  const createdUser = await createUserHelper(userPayload);
  const loginResponse = await loginUserHelper({ ...createdUser });
  const token = (await loginResponse.json()).accessToken;
  const walletResponse = await addFundsHelper(token, amount);
  return {
    createdUser,
    loginResponse,
    token,
    walletResponse,
  };
}

describe("Wallet", () => {
  describe("[POST] /wallet/ add-funds", () => {
    describe("given a valid amount and user is authenticated", () => {
      let walletRes: any;
      beforeEach(async () => {
        const { walletResponse } = await addFundsPipeline(
          userPayload,
          testAmounts[0]
        );
        walletRes = walletResponse;
      });
      it("should respond with a 201", () => {
        expect(walletRes.statusCode).toBe(codes.CREATED);
      });
      it("should add an amount to the user's wallet", async () => {
        const userWallet = (await prisma.wallet.findMany())[0];
        expect(userWallet.funds).toBe(testAmounts[0]);
      });
      it("should call WalletService.addAmount once", async () => {
        await resetDb();
        jest.clearAllMocks();
        const spy = jest.spyOn(WalletService.prototype, "addAmount");
        await addFundsPipeline(userPayload, testAmounts[0]);
        expect(WalletService.prototype.addAmount).toBeCalledTimes(1);
      });
      it("should responsd with the total available ", async () => {
        const data = await walletRes.json();
        expect(data).toHaveProperty("amount");
        expect(data.amount).toBe(testAmounts.reduce((sum, curr) => sum + curr));
      });
    });
    describe("given amount is missing", () => {
      it("should return a 400", async () => {
        const { walletResponse } = await addFundsPipeline(userPayload);
        expect(walletResponse.statusCode).toBe(400);
      });
    });
    describe("given user is not authenticated", () => {
      it("should return a 401", async () => {
        const createdUser = await createUserHelper(userPayload);
        const res = await loginUserHelper({ ...createdUser });
        const token = (await res.json()).accessToken;
        const walletRes = await addFundsHelper("invalid-token", testAmounts[0]);
        expect(walletRes.statusCode).toBe(401);
      });
    });
  });
});
