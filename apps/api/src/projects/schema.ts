import { z } from "zod";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "../domain/types.js";
import { toDateOrNull } from "../clients/schema.js";

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

export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export const projectPrioritySchema = z.enum(PROJECT_PRIORITIES);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1),
  description: blankToNull,
  clientId: z.string().min(1),
  ownerUserId: z.string().min(1),
  status: z.literal("draft").optional(),
  startDate: optionalDate,
  dueDate: optionalDate,
  priority: projectPrioritySchema.optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  notes: blankToNull,
  workspaceId: z.unknown().optional(),
  createdAt: z.unknown().optional(),
});

export const patchProjectSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: blankToNull,
  clientId: z.string().min(1).optional(),
  ownerUserId: z.string().min(1).optional(),
  status: projectStatusSchema.optional(),
  startDate: optionalDate,
  dueDate: optionalDate,
  priority: projectPrioritySchema.optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  notes: blankToNull,
  workspaceId: z.unknown().optional(),
  createdAt: z.unknown().optional(),
});

export { toDateOrNull };
