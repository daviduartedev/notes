import { z } from "zod";
import {
  REMINDER_ACTIONS,
  REMINDER_STATUSES,
} from "../domain/reminder-status.js";

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

const requiredDate = z.string().transform((value, ctx) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "data inválida" });
    return z.NEVER;
  }
  return parsed;
});

export const reminderStatusSchema = z.enum(REMINDER_STATUSES);
export const reminderActionSchema = z.enum(REMINDER_ACTIONS);

export const createReminderSchema = z.object({
  draftMessage: z.string().trim().min(1),
  dueAt: requiredDate,
  clientId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  workspaceId: z.unknown().optional(),
});

export const decideReminderSchema = z.object({
  action: reminderActionSchema,
  snoozeUntil: optionalDate,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  channel: z.unknown().optional(),
  draftMessage: z.unknown().optional(),
});
