import { ReminderActions } from "@/components/reminder-actions";
import { StatusPill } from "@/components/ui/status-pill";
import type { ReminderDto } from "@/lib/domain-types";
import { reminderStatusLabel } from "@/lib/labels";
import { REMINDERS_EMPTY, reminderHref } from "@/lib/reminder-copy";
import { reminderStatusTone } from "@/lib/status-tone";

export function ProjectReminders({ reminders }: { reminders: ReminderDto[] }) {
  if (reminders.length === 0) {
    return <p className="text-sm text-notes-muted">{REMINDERS_EMPTY}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {reminders.map((reminder) => (
        <div key={reminder.id} className="flex flex-col gap-3 border-b border-notes-border pb-4 last:border-b-0">
          <a href={reminderHref(reminder.id)} className="flex flex-wrap items-center gap-2">
            <StatusPill tone={reminderStatusTone[reminder.status]}>
              {reminderStatusLabel[reminder.status]}
            </StatusPill>
            {reminder.visualState === "overdue" ? (
              <StatusPill tone="red">Atrasado</StatusPill>
            ) : null}
            <span className="text-sm text-notes-muted">canal interno</span>
          </a>
          <ReminderActions reminder={reminder} />
        </div>
      ))}
    </div>
  );
}
