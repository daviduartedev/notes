import { AppShell } from "@/components/app-shell";
import { MEETINGS_LOADING } from "@/lib/meeting-copy";

export default function ReunioesLoading() {
  return (
    <AppShell title="Reuniões" pathname="/reunioes">
      <p className="text-sm text-notes-muted">{MEETINGS_LOADING}</p>
    </AppShell>
  );
}
