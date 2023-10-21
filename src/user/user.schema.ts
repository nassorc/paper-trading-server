import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const loginResponseSchema = z.object({
  accessToken: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export { loginSchema };
export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  loginSchema,
  loginResponseSchema,
});
