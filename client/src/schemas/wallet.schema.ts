import { z } from "zod";

export const WalletSchema = z.object({
  address: z.string().min(3),
  chainId: z.number().int().nonnegative(),
  provider: z.string().optional(),
  label: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().optional(),
});

export type Wallet = z.infer<typeof WalletSchema>;
