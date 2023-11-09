import prisma from "../../src/libs/prisma";
import app from "./create_server";

export interface LoginInputType {
  username: string;
  password: string;
}

export async function createUserHelper({ username, password }: LoginInputType) {
  return await prisma.user.create({
    data: {
      username,
      password,
      wallet: {
        create: {},
      },
      portfolio: {
        create: {},
      },
      watchlist: {
        create: {},
      },
    },
  });
}

export async function loginUserHelper(credentials: Partial<LoginInputType>) {
  return await app.inject({
    method: "POST",
    url: "/login",
    body: credentials,
  });
}

export async function registerUserHelper(credentials: Partial<LoginInputType>) {
  return await app.inject({
    method: "POST",
    url: "/register",
    body: credentials,
  });
}

export async function addFundsHelper(token?: string, amount?: number) {
  return await app.inject({
    method: "POST",
    url: `/wallet/add-funds`,
    headers: {
      authorization: `bearer ${token}`,
    },
    body: {
      amount: amount,
    },
  });
}

export async function getStockQuoteHelper(symbol: string) {
  return await app.inject({
    method: "GET",
    url: `/stock/${symbol}`,
  });
}
