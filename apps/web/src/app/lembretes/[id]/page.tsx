import { AppShell } from "@/components/app-shell";
import { ReminderActions } from "@/components/reminder-actions";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { ReminderDto } from "@/lib/domain-types";
import { reminderStatusLabel } from "@/lib/labels";
import { REMINDER_NOT_FOUND, reminderProjectHref } from "@/lib/reminder-copy";
import { serverApi } from "@/lib/server-api";
import { reminderStatusTone } from "@/lib/status-tone";

export default async function LembreteFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await serverApi<ReminderDto>(`/api/reminders/${id}`);
  const reminder = detail.status === 200 ? detail.data : null;

  return (
    <AppShell title="Lembrete" pathname="/lembretes">
      {!reminder ? (
        <p className="text-sm text-semantic-red">{REMINDER_NOT_FOUND}</p>
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusPill tone={reminderStatusTone[reminder.status]}>
              {reminderStatusLabel[reminder.status]}
            </StatusPill>
            <StatusPill tone="blue">Interno</StatusPill>
            {reminder.visualState === "overdue" ? <StatusPill tone="red">Atrasado</StatusPill> : null}
          </div>
          <p className="mb-4 text-sm text-notes-muted">
            {reminder.projectId ? (
              <a href={reminderProjectHref(reminder.projectId)}>{reminder.projectName}</a>
            ) : (
              reminder.projectName
            )}
            {" · "}
            {reminder.clientName}
          </p>
          <ReminderActions reminder={reminder} />
        </Card>
      )}
    </AppShell>
  );
}
