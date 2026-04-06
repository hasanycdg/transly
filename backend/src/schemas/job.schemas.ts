import { z } from "zod";

export const jobIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(128)
});

export type JobIdParamsDto = z.infer<typeof jobIdParamsSchema>;
