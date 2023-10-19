const stockQuote = {
  type: "object",
  required: ["symbol", "price", "volume"],
  properties: {
    symbol: { type: "string" },
    price: { type: "string" },
    volume: { type: "string" },
  },
};

const getStockQuote = {
  params: {
    type: "object",
    required: ["symbol"],
    properties: {
      symbol: {
        type: "string",
      },
    },
  },
  response: {
    200: stockQuote,
  },
};

export { getStockQuote };
