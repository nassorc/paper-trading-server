import { z, ZodNumber } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const stockQuote = z.object({
  symbol: z.string(),
  price: z.number(),
});

const getStockQuoteInput = z.object({
  symbol: z.string(),
});

const purchaseStockInput = z.object({
  symbol: z.string(),
  // price: z.number(),
  quantity: z.number(),
});

const sellStockInput = z.object({
  symbol: z.string(),
  quantity: z.number(),
});

export type StockQuoteType = z.infer<typeof stockQuote>;
export type StockOrderType = z.infer<typeof purchaseStockInput>;
export type StockSellType = z.infer<typeof sellStockInput>;

export const { schemas: stockSchemas, $ref } = buildJsonSchemas(
  {
    getStockQuoteInput,
    stockQuote,
    purchaseStockInput,
    sellStockInput,
  },
  { $id: "StockSchema" }
);

// const stockQuote = {
//   type: "object",
//   required: ["symbol", "price", "volume"],
//   properties: {
//     symbol: { type: "string" },
//     price: { type: "string" },
//     volume: { type: "string" },
//   },
// };

// const getStockQuote = {
//   params: {
//     type: "object",
//     required: ["symbol"],
//     properties: {
//       symbol: {
//         type: "string",
//       },
//     },
//   },
//   response: {
//     200: stockQuote,
//   },
// };

// const purchaseStock = {
//   body: {
//     type: "object",
//     required: ["symbol", "price", "quantity"],
//     properties: {
//       symbol: { type: "string" },
//       price: { type: "number" },
//       quantity: { type: "number" },
//     },
//   },
// };

// export { getStockQuote, purchaseStock };
