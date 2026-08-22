import { z } from "zod";
import { MAX_ATTENTION_LEAD_DAYS } from "../domain/attention-lead.js";

export const patchWorkspaceSchema = z.object({
  attentionLeadDays: z.coerce.number().int().min(0).max(MAX_ATTENTION_LEAD_DAYS),
  workspaceId: z.unknown().optional(),
});
