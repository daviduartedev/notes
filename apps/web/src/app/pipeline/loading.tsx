import { AppShell } from "@/components/app-shell";
import { PIPELINE_LOADING } from "@/lib/pipeline-copy";

export default function PipelineLoading() {
  return (
    <AppShell title="Pipeline" pathname="/pipeline">
      <p className="text-sm text-notes-muted">{PIPELINE_LOADING}</p>
    </AppShell>
  );
}
