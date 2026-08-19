import { AppShell } from "@/components/app-shell";
import { WORKFLOWS_LOADING } from "@/lib/workflow-copy";

export default function WorkflowsLoading() {
  return (
    <AppShell title="Workflows" pathname="/workflows">
      <p className="text-sm text-notes-muted">{WORKFLOWS_LOADING}</p>
    </AppShell>
  );
}
