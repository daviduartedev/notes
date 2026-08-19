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

export const reminderStatusSchema = z.enum(REMINDER_STATUSES);
export const reminderActionSchema = z.enum(REMINDER_ACTIONS);

export const decideReminderSchema = z.object({
  action: reminderActionSchema,
  snoozeUntil: optionalDate,
  workspaceId: z.unknown().optional(),
  status: z.unknown().optional(),
  channel: z.unknown().optional(),
  draftMessage: z.unknown().optional(),
});
