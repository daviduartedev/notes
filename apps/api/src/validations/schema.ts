import { z } from "zod";
import { VALIDATION_STATUSES, VALIDATION_TYPES } from "../domain/validation-status.js";
import { toDateOrNull } from "../projects/schema.js";

const blankToNull = z
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
    return value;
  })
  .refine(
    (value) => value === undefined || value === null || !Number.isNaN(Date.parse(value)),
    { message: "data inválida" },
  );

const optionalId = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value.trim() === "") return null;
    return value;
  });

export const validationTypeSchema = z.enum(VALIDATION_TYPES);
export const validationStatusSchema = z.enum(VALIDATION_STATUSES);

export const createValidationSchema = z.object({
  type: validationTypeSchema,
  stageId: optionalId,
  reviewerUserId: optionalId,
  environment: blankToNull,
  dueDate: optionalDate,
  notes: blankToNull,
  items: z.array(z.string().trim().min(1)).optional(),
  checklistId: optionalId,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  requesterUserId: z.unknown().optional(),
});

export const patchValidationSchema = z.object({
  type: validationTypeSchema.optional(),
  stageId: optionalId,
  reviewerUserId: optionalId,
  environment: blankToNull,
  dueDate: optionalDate,
  notes: blankToNull,
  items: z.array(z.string().trim().min(1)).optional(),
  resultNotes: blankToNull,
  checklistId: optionalId,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  requesterUserId: z.unknown().optional(),
  requestedAt: z.unknown().optional(),
  createdAt: z.unknown().optional(),
});

export const transitionValidationSchema = z.object({
  to: validationStatusSchema,
  resultNotes: blankToNull,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
});

export { toDateOrNull };
