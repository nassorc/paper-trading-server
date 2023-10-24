import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import Redis, { RedisCommander } from "ioredis";
import { PrismaClient } from "@prisma/client";

interface User {
  id: string;
  username: string;
  password: string;
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

let data: Optional<User, "id"> = {
  username: "matthew",
  password: "32",
};

type data<T> = {
  data: T;
};
type unio = "hello" | "world";
type UserKeys<T, K extends unio> = data<T>;
let a: UserKeys<number, "hello"> = { data: 10 };

declare module "fastify" {
  export interface FastifyInstance {
    redis: RedisCommander;
    db: PrismaClient;
  }
}

function dbConnectionPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  // database connection
  const prisma = new PrismaClient();
  fastify.decorate("db", prisma);
  // redis connection
  const redis = new Redis();
  fastify.decorate("redis", redis);
  done();
}

const decorated = fp(dbConnectionPlugin);

export { decorated as dbConnectionPlugin };
