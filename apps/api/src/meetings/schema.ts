import { z } from "zod";
import { MEETING_TYPES } from "../domain/meeting-type.js";

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

const requiredDate = z.string().transform((value, ctx) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "data inválida" });
    return z.NEVER;
  }
  return parsed;
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

const participantIds = z
  .array(z.string())
  .optional()
  .transform((value) => value ?? []);

export const meetingTypeSchema = z.enum(MEETING_TYPES);

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1),
  type: meetingTypeSchema,
  startsAt: requiredDate,
  participantUserIds: participantIds,
  notes: blankToNull,
  decisions: blankToNull,
  nextSteps: blankToNull,
  clientId: optionalId,
  projectId: optionalId,
  stageId: optionalId,
  validationId: optionalId,
  workspaceId: z.unknown().optional(),
});

export const patchMeetingSchema = z.object({
  title: z.string().trim().min(1).optional(),
  type: meetingTypeSchema.optional(),
  startsAt: optionalDate,
  participantUserIds: z.array(z.string()).optional(),
  notes: blankToNull,
  decisions: blankToNull,
  nextSteps: blankToNull,
  workspaceId: z.unknown().optional(),
  clientId: z.unknown().optional(),
  projectId: z.unknown().optional(),
  stageId: z.unknown().optional(),
  validationId: z.unknown().optional(),
});
