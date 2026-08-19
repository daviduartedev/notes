import { z } from "zod";
import {
  BLOCKER_ACTIONS,
  BLOCKER_ASSIGNEE_KINDS,
  BLOCKER_STATUSES,
} from "../domain/blocker-status.js";

const blankToNull = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    return value;
  });

const optionalId = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    return value;
  });

const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  });

export const blockerStatusSchema = z.enum(BLOCKER_STATUSES);
export const blockerAssigneeKindSchema = z.enum(BLOCKER_ASSIGNEE_KINDS);
export const blockerActionSchema = z.enum(BLOCKER_ACTIONS);

export const createBlockerSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  assigneeKind: blockerAssigneeKindSchema,
  assigneeUserId: optionalId,
  blocksStageId: optionalId,
  blocksProject: z.boolean().optional(),
  dueDate: optionalDate,
  notes: blankToNull,
  sourceMeetingId: optionalId,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  openedAt: z.unknown().optional(),
});

export const decideBlockerSchema = z.object({
  action: blockerActionSchema,
  notes: blankToNull,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
});
