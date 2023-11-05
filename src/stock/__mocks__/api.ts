export const mockStockAPIFile = jest.fn();
const mock = jest.fn().mockImplementation(() => {
  return {
    getStockQuote: mockStockAPIFile,
  };
});
export default mock;
