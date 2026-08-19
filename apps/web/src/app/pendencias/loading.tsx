import { AppShell } from "@/components/app-shell";
import { BLOCKERS_LOADING } from "@/lib/blocker-copy";

export default function PendenciasLoading() {
  return (
    <AppShell title="Pendências" pathname="/pendencias">
      <p className="text-sm text-notes-muted">{BLOCKERS_LOADING}</p>
    </AppShell>
  );
}
