import { AppShell } from "@/components/app-shell";
import { REMINDERS_LOADING } from "@/lib/reminder-copy";

export default function LembretesLoading() {
  return (
    <AppShell title="Lembretes" pathname="/lembretes">
      <p className="text-sm text-notes-muted">{REMINDERS_LOADING}</p>
    </AppShell>
  );
}
