import { z } from "zod";
import { STAGE_PHASES } from "../domain/types.js";

const stageInputSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/),
  label: z.string().trim().min(1),
  phase: z.enum(STAGE_PHASES),
  order: z.coerce.number().int().min(1).max(20),
  allowedNextKeys: z.array(z.string().trim().min(1)).optional(),
  entryCriteria: z.string().trim().min(1).optional(),
  exitCriteria: z.string().trim().min(1).optional(),
});

export const createWorkflowTemplateSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/),
  name: z.string().trim().min(1),
  isDefault: z.boolean().optional(),
  stages: z.array(stageInputSchema).min(1).max(20),
  workspaceId: z.unknown().optional(),
});

export const patchWorkflowTemplateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  isDefault: z.boolean().optional(),
  stages: z.array(stageInputSchema).min(1).max(20).optional(),
  workspaceId: z.unknown().optional(),
});

export function normalizeStageInputs(
  stages: Array<{
    key: string;
    label: string;
    phase: (typeof STAGE_PHASES)[number];
    order: number;
    allowedNextKeys?: string[];
    entryCriteria?: string;
    exitCriteria?: string;
  }>,
) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const keys = new Set(sorted.map((stage) => stage.key));
  if (keys.size !== sorted.length) {
    return null;
  }
  return sorted.map((stage, index) => {
    const next = sorted[index + 1];
    return {
      key: stage.key,
      label: stage.label,
      phase: stage.phase,
      order: index + 1,
      allowedNextKeys: stage.allowedNextKeys ?? (next ? [next.key] : []),
      entryCriteria: stage.entryCriteria ?? "",
      exitCriteria: stage.exitCriteria ?? "",
    };
  });
}
