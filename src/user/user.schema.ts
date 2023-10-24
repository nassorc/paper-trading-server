import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const loginInputSchema = z.object({
  username: z.string(),
  password: z.string(),
});
const loginOutputSchema = z.object({
  accessToekn: z.string(),
});
const UserSafeOutputSchema = z.object({
  id: z.number(),
  username: z.string(),
});

const loginResponseSchema = z.object({
  accessToken: z.string(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export { loginInputSchema as loginSchema };
export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  loginSchema: loginInputSchema,
  loginOutputSchema,
  UserSafeOutputSchema,
  loginResponseSchema,
});
