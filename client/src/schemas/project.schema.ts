import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(2),
  ownerAddress: z.string().min(3),
  contactEmail: z.string().email().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
