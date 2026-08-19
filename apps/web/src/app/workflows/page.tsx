import { AppShell } from "@/components/app-shell";
import { WorkflowManager } from "@/components/workflow-manager";
import {
  WORKFLOWS_FORBIDDEN,
  WORKFLOWS_LOAD_ERROR,
} from "@/lib/workflow-copy";
import type { WorkflowTemplateDto } from "@/lib/domain-types";
import { serverApi } from "@/lib/server-api";

export default async function WorkflowsPage() {
  const [meRes, templatesRes] = await Promise.all([
    serverApi<{ role: string }>("/api/me"),
    serverApi<WorkflowTemplateDto[]>("/api/workflow-templates"),
  ]);
  const isOwner = meRes.data?.role === "owner";
  const templates = templatesRes.status === 200 && templatesRes.data ? templatesRes.data : [];
  const loadError = templatesRes.status !== 200;

  return (
    <AppShell title="Workflows" pathname="/workflows">
      {!isOwner ? (
        <p className="text-sm text-semantic-red">{WORKFLOWS_FORBIDDEN}</p>
      ) : loadError ? (
        <p className="text-sm text-semantic-red">{WORKFLOWS_LOAD_ERROR}</p>
      ) : (
        <WorkflowManager templates={templates} />
      )}
    </AppShell>
  );
}
