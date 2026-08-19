import { AppShell } from "@/components/app-shell";
import { CHECKLISTS_LOADING } from "@/lib/checklist-copy";

export default function ChecklistsLoading() {
  return (
    <AppShell title="Checklists" pathname="/checklists">
      <p className="text-sm text-notes-muted">{CHECKLISTS_LOADING}</p>
    </AppShell>
  );
}
