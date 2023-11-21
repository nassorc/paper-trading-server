import codes from "../../src/utils/reponse_code";
import {
  addFundsHelper,
  buyStock,
  loginUserHelper,
  registerUserHelper,
  prefetchStockQuoteFromAPI,
} from "../helpers/database_utils";
import { data } from "../helpers/sharedData";
import prisma from "../../src/libs/prisma";
import axios from "axios";

jest.mock("axios");

// TODO: mock stock api return value
let prefetchStockQuote: any;
beforeAll(async () => {
  prefetchStockQuote = await prefetchStockQuoteFromAPI(data.testStockSymbol);
});

async function registerLoginAndAddFunds(amount: number) {
  const registerRes = await registerUserHelper(data.testUser);
  const createdUser = await registerRes.json();
  const accessToken = await (await loginUserHelper(data.testUser)).json()
    .accessToken;
  const wallet = await addFundsHelper(accessToken, amount);
  return {
    accessToken: accessToken,
    credentials: { ...data.testUser, userId: createdUser.userId },
  };
}

describe("StockOrder", () => {
  beforeAll(() => {
    const axiosMocked = axios as jest.Mocked<typeof axios>;
    axiosMocked.get.mockResolvedValue({
      data: [prefetchStockQuote],
    });
  });
  describe("[POST] /stock/buy", () => {
    describe("given order is a single stock and the user has sufficient funds", () => {
      it("should respond with a 200", async () => {
        // const createdUser = await createUserHelper(data.testUser);
        const { accessToken } = await registerLoginAndAddFunds(
          data.walletTestAmount
        );
        const res = await buyStock(data.buySingleStockPayload, accessToken);
        expect(res.statusCode).toBe(codes.CREATED);
      });
      it("should add stock to portfolio", async () => {
        const {
          accessToken,
          credentials: { userId },
        } = await registerLoginAndAddFunds(data.walletTestAmount);
        const portfolioCollectionInitialState =
          await prisma.portfolio.findFirst({
            include: { stocks: true },
          });
        expect(portfolioCollectionInitialState?.stocks.length).toBe(0);
        const res = await buyStock(data.buySingleStockPayload, accessToken);
        const portfolioRecord = await prisma.portfolio.findFirst({
          include: { stocks: true },
        });
        expect(portfolioRecord?.stocks.length).toBe(1);
      });
      it("should subtract purchase amount from the user's wallet", async () => {
        const {
          accessToken,
          credentials: { userId },
        } = await registerLoginAndAddFunds(data.walletTestAmount);
        const res = await buyStock(data.buySingleStockPayload, accessToken);
        const walletRecord = await prisma.wallet.findFirst({
          where: { ownerId: userId },
        });
        const expectedWalletAmount =
          data.walletTestAmount -
          data.buySingleStockPayload.price *
            data.buySingleStockPayload.quantity;
        console.log(data.buySingleStockPayload.price);
        expect(walletRecord?.funds).toBeCloseTo(expectedWalletAmount);
      });
      it("should create a transaction order", async () => {});
      // it("should call StockOrderService.purcahseStock once", () => {});
    });
    describe("given valid or but user does NOT have sufficient funds", () => {
      it("should NOT make purchase if user does NOT have enough funds", async () => {
        const {
          accessToken,
          credentials: { userId },
        } = await registerLoginAndAddFunds(
          data.buySingleStockPayload.price - 1
        );
        const res = await buyStock(data.buySingleStockPayload, accessToken);
        console.log(await res.json());
        expect(res.statusCode).toBe(400);
      });
    });
    describe("given order is missing symbol or quantity", () => {
      it("should response with a 400", async () => {
        const {
          accessToken,
          credentials: { userId },
        } = await registerLoginAndAddFunds(
          data.buySingleStockPayload.price - 1
        );
        const res = await buyStock({}, accessToken);
        expect(res.statusCode).toBe(400);
      });
    });
  });
  describe("[POST] /stock/sell", () => {
    describe("given order is a single stock and the user has sufficient funds", () => {});
  });
});
