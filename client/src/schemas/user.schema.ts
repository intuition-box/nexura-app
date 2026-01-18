import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().optional(),
  address: z.string().min(3),
  username: z.string().optional(),
  email: z.string().email().optional(),
  createdAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type User = z.infer<typeof UserSchema>;
