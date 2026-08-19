export const REMINDER_STATUSES = [
  "scheduled",
  "due",
  "done",
  "snoozed",
  "cancelled",
] as const;
export type ReminderStatus = (typeof REMINDER_STATUSES)[number];

export const REMINDER_ACTIONS = ["complete", "snooze", "cancel"] as const;
export type ReminderAction = (typeof REMINDER_ACTIONS)[number];

export const REMINDER_CHANNELS = ["internal"] as const;
export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];

export const REMINDER_SUBJECT_TYPES = ["project", "client"] as const;
export type ReminderSubjectType = (typeof REMINDER_SUBJECT_TYPES)[number];

export const ACTIVE_REMINDER_STATUSES = ["scheduled", "due"] as const;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_SNOOZE_MS = 7 * DAY_MS;

const TRANSITIONS: Record<ReminderStatus, readonly ReminderAction[]> = {
  scheduled: ["cancel"],
  due: ["complete", "snooze", "cancel"],
  done: [],
  snoozed: [],
  cancelled: [],
};

export function isActiveReminderStatus(status: ReminderStatus): boolean {
  return (ACTIVE_REMINDER_STATUSES as readonly string[]).includes(status);
}

export function canDecideReminder(from: ReminderStatus, action: ReminderAction): boolean {
  return TRANSITIONS[from].includes(action);
}

export function listAllowedReminderActions(from: ReminderStatus): ReminderAction[] {
  return [...TRANSITIONS[from]];
}

export function promoteScheduledIfDue(status: ReminderStatus, dueAt: Date, now: Date): ReminderStatus {
  if (status === "scheduled" && dueAt.getTime() <= now.getTime()) {
    return "due";
  }
  return status;
}

export type ReminderDecisionResult =
  | {
      ok: true;
      status: ReminderStatus;
      dueAt: Date;
      doneAt: Date | null;
      cancelledAt: Date | null;
      snoozedUntil: Date | null;
      event: "reminder.completed" | null;
    }
  | { ok: false; reason: string };

export function applyReminderDecision(input: {
  from: ReminderStatus;
  action: ReminderAction;
  now: Date;
  dueAt: Date;
  doneAt: Date | null;
  cancelledAt: Date | null;
  snoozeUntil?: Date | null;
}): ReminderDecisionResult {
  if (!canDecideReminder(input.from, input.action)) {
    return { ok: false, reason: "Transição inválida" };
  }
  if (input.action === "complete") {
    return {
      ok: true,
      status: "done",
      dueAt: input.dueAt,
      doneAt: input.now,
      cancelledAt: input.cancelledAt,
      snoozedUntil: null,
      event: "reminder.completed",
    };
  }
  if (input.action === "cancel") {
    return {
      ok: true,
      status: "cancelled",
      dueAt: input.dueAt,
      doneAt: input.doneAt,
      cancelledAt: input.now,
      snoozedUntil: null,
      event: null,
    };
  }
  const snoozedUntil =
    input.snoozeUntil && !Number.isNaN(input.snoozeUntil.getTime())
      ? input.snoozeUntil
      : new Date(input.now.getTime() + DEFAULT_SNOOZE_MS);
  return {
    ok: true,
    status: "scheduled",
    dueAt: snoozedUntil,
    doneAt: input.doneAt,
    cancelledAt: input.cancelledAt,
    snoozedUntil,
    event: null,
  };
}

export function reminderVisualState(
  status: ReminderStatus,
  dueAt: Date,
  now: Date,
): "overdue" | null {
  if (status !== "due") {
    return null;
  }
  return dueAt.getTime() < now.getTime() ? "overdue" : null;
}
