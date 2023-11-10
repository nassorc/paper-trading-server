import StockDataSourceAPI from "../../src/stock/api";

const testStockSymbol = "AAPL";
const testPrice = 101.98;

const quote = (async function () {
  let prefetchStockQuote;
  try {
    const api = new StockDataSourceAPI();
    prefetchStockQuote = await api.getStockQuote(testStockSymbol);
  } catch (err: any) {
    prefetchStockQuote = {
      symbol: testStockSymbol,
      price: testPrice,
    };
  }
})();
const data = {
  testUser: {
    username: "test-user",
    password: "test-user-password",
  },
  testStockQuote: quote,
  testStockSymbol: testStockSymbol,
  buySingleStockPayload: {
    symbol: testStockSymbol,
    price: testPrice,
    quantity: 1,
  },
  walletTestAmount: 10000,
};
export { data };
