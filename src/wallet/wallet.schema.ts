import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const getWalletInput = z.object({
  id: z.number(),
});

const walletOutput = z.object({
  id: z.number(),
  funds: z.number(),
});

export type WalletType = z.infer<typeof walletOutput>;
export type WalletInputType = z.infer<typeof getWalletInput>;

export const { schemas: walletSchemas, $ref } = buildJsonSchemas(
  {
    getWalletInput,
    walletOutput,
  },
  { $id: "WalletSchema" }
);
