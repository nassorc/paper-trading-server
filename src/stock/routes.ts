import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyPluginOptions,
  FastifySchema,
} from "fastify";
import axios from "axios";

declare module "fastify" {
  export interface FastifyInstance {
    logRoute: (routeName: string) => void;
  }
}

interface StockQuoteType {
  symbol: string;
  price: number;
  volume: number;
}

async function fetchStockQuote(symbol: string) {
  // const data = await axios.get(
  //   "https://financialmodelingprep.com/api/v3/search?query=AA&apikey=kSeiJnFZy0iDcmMywnjlpyoq15ZtBMfU"
  // );
  const data = {
    symbol: "AAPL",
    price: 177.15,
    volume: 55881270,
  };
  // return data;
}

// async function getStockQuoteController(cache: any, symbol: string): StockQuoteType {
//   const key = `quote:${symbol}`;
//   // CACHE HIT
//   if (await fastify.redis.exists(key)) {
//     const data = await fastify.redis.hgetall(key);
//     return reply.code(200).send(data);
//   }
//   // CACHE MISS - fetch from api then store in cache
//   fastify.redis.hset(key, data);

//   const data = fetchStockQuote(symbol);
//   return data;
// }

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.decorate("logRoute", (routeName: string) => {
    console.log(routeName);
  });

  fastify.get(
    "/stock/:symbol",
    {
      schema: {
        response: {
          200: {
            symbol: { type: "string" },
            price: { type: "number" },
            volume: { type: "number" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { symbol: string } }>,
      reply: FastifyReply
    ) => {
      // const res = await axios.get(
      //   "https://financialmodelingprep.com/api/v3/search?query=AA&apikey=kSeiJnFZy0iDcmMywnjlpyoq15ZtBMfU"
      // );
      const symbol = request.params["symbol"];
      // const data = await getStockQuoteController(fastify.redis, symbol);

      const data = {
        symbol: "AAPL",
        price: 177.15,
        volume: 55881270,
      };
      return reply.code(200).send(data);
    }
  );
  const stockSchema = {
    type: "object",
    required: [],
    properties: {
      symbol: { type: "string" },
      name: { type: "string" },
    },
  };
  const schema: FastifySchema = {
    body: stockSchema,
    response: {
      200: {
        symbol: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
    },
  };

  fastify.post(
    "/stock",
    { schema },
    async (
      request: FastifyRequest<{ Body: { symbol: string } }>,
      reply: FastifyReply
    ) => {
      console.log("BODY: ", request.body);
      return request.body;
    }
  );
  done();
}
