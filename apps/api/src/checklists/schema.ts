import { z } from "zod";

export const applyChecklistSchema = z.object({
  templateId: z.string().trim().min(1),
  stageId: z.string().trim().min(1).optional(),
  workspaceId: z.unknown().optional(),
});

export const patchChecklistItemSchema = z.object({
  completed: z.boolean(),
  note: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }),
  workspaceId: z.unknown().optional(),
});

export const patchChecklistTemplateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1),
      }),
    )
    .min(1)
    .optional(),
  workspaceId: z.unknown().optional(),
});
