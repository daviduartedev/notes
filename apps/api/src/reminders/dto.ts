import {
  listAllowedReminderActions,
  reminderVisualState,
} from "../domain/reminder-status.js";
import type { ReminderRecord } from "../store/types.js";

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeReminder(row: ReminderRecord, now: Date) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    clientId: row.clientId,
    clientName: row.clientName,
    projectId: row.projectId,
    projectName: row.projectName,
    channel: row.channel,
    policyKey: row.policyKey,
    status: row.status,
    dueAt: row.dueAt.toISOString(),
    snoozedUntil: iso(row.snoozedUntil),
    doneAt: iso(row.doneAt),
    cancelledAt: iso(row.cancelledAt),
    draftMessage: row.draftMessage,
    visualState: reminderVisualState(row.status, row.dueAt, now),
    allowedActions: listAllowedReminderActions(row.status),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
