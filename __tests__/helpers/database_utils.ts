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
