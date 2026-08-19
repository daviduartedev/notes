import { z } from "zod";
import { APPROVAL_ACTIONS, APPROVAL_KINDS, APPROVAL_STATUSES } from "../domain/approval-status.js";

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

export const approvalKindSchema = z.enum(APPROVAL_KINDS);
export const approvalStatusSchema = z.enum(APPROVAL_STATUSES);
export const approvalActionSchema = z.enum(APPROVAL_ACTIONS);

export const createApprovalSchema = z.object({
  projectId: z.string().trim().min(1),
  kind: approvalKindSchema,
  validationId: optionalId,
  comment: blankToNull,
  subjectType: z.unknown().optional(),
  subjectId: z.unknown().optional(),
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  approverId: z.unknown().optional(),
  projectSnapshot: z.unknown().optional(),
});

export const decideApprovalSchema = z.object({
  action: approvalActionSchema,
  comment: blankToNull,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  approverId: z.unknown().optional(),
});
