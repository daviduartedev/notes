import { z } from "zod";
import { projectPrioritySchema } from "../projects/schema.js";

export const pipelineQuerySchema = z.object({
  ownerUserId: z.string().trim().min(1).optional(),
  clientId: z.string().trim().min(1).optional(),
  priority: projectPrioritySchema.optional(),
  workspaceId: z.unknown().optional(),
});
