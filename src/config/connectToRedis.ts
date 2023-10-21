import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import Redis, { RedisCommander } from "ioredis";

declare module "fastify" {
  export interface FastifyInstance {
    redis: RedisCommander;
  }
}

function redisPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  const redis = new Redis();
  fastify.decorate("redis", redis);
  done();
}

const decoratedRedisPlugin = fp(redisPlugin);

export { decoratedRedisPlugin as redisPlugin };
