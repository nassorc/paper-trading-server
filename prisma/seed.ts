import prisma from "../src/libs/prisma";
import process from "process";

const users = [
  {
    username: "admin0",
    password: "admin",
    funds: 1500,
    watchlist: [{ symbol: "BTC/USD" }],
  },
  {
    username: "admin1",
    password: "admin",
    funds: 1500,
    watchlist: [{ symbol: "EUR/USD" }],
  },
  {
    username: "admin2",
    password: "admin",
    funds: 1500,
    watchlist: [{ symbol: "EUR/USD" }, { symbol: "BTC/USD" }],
  },
];

async function main() {
  users.forEach(async ({ username, password, funds, watchlist }) => {
    try {
      const user = await prisma.user.create({
        data: {
          username,
          password,
          wallet: {
            create: {
              funds,
            },
          },
          watchlist: {
            create: {
              symbols: {
                connectOrCreate:
                  watchlist.map((stock) => {
                    return {
                      where: {
                        symbol: stock.symbol,
                      },
                      create: {
                        symbol: stock.symbol,
                      },
                    };
                  }) || [],
              },
            },
          },
        },
      });
      console.log(`SEED: added user ${user.id}`);
    } catch (err: any) {}
  });
  // }
}
main();
