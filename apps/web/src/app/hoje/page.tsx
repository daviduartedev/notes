import { AppShell } from "@/components/app-shell";
import { HOJE_EMPTY_STATE } from "@/lib/hoje-copy";

export default function HojePage() {
  return (
    <AppShell title="Hoje" pathname="/hoje">
      <section className="rounded-lg border border-dashed border-notes-border bg-notes-panel p-8">
        <p className="text-notes-muted">{HOJE_EMPTY_STATE}</p>
      </section>
    </AppShell>
  );
}
