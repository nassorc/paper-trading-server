import StockDataSourceAPI from "./api";
import axios from "axios";

const stockQuoteOutput = {
  symbol: "AAPL",
  price: 100,
  volume: 1000,
};
const api = new StockDataSourceAPI();
const spyOnget = jest.spyOn(axios, "get");
spyOnget.mockResolvedValue({ data: [stockQuoteOutput] });

describe("StockDataSourceAPI", () => {
  describe("get stock quote", () => {
    describe("given valid stock symol", () => {
      it("should return the stock quote", async () => {
        expect(await api.getStockQuote(stockQuoteOutput.symbol)).toEqual(
          stockQuoteOutput
        );
      });
    });
  });
});
