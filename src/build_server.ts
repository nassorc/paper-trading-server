import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyPluginOptions,
} from "fastify";


export async function buildServer(): Promise<FastifyInstance> {
  console.log(await redis.get("name"));
  const fastify = Fastify({
    logger: true,
  });

  return fastify;
}
