import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import {
  APPROVALS_EMPTY,
  APPROVALS_LOAD_ERROR,
  approvalHref,
} from "@/lib/approval-copy";
import type {
  ApprovalDto,
  ApprovalKind,
  ApprovalStatus,
  ClientDto,
  ProjectDto,
} from "@/lib/domain-types";
import { approvalKindLabel, approvalStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { approvalStatusTone } from "@/lib/status-tone";

const statuses: ApprovalStatus[] = ["pending", "granted", "rejected", "cancelled", "revoked"];
const kinds: ApprovalKind[] = [
  "proposal",
  "scope",
  "prototype",
  "staging",
  "production",
  "final_acceptance",
];

export default async function AprovacoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    projectId?: string;
    clientId?: string;
    approverId?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.approverId) params.set("approverId", filters.approverId);
  const query = params.toString();

  const [approvalsRes, clientsRes, projectsRes] = await Promise.all([
    serverApi<ApprovalDto[]>(`/api/approvals${query ? `?${query}` : ""}`),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ProjectDto[]>("/api/projects"),
  ]);
  const approvals = approvalsRes.status === 200 && approvalsRes.data ? approvalsRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const loadError = approvalsRes.status !== 200;

  return (
    <AppShell title="Aprovações" pathname="/aprovacoes">
      <Card>
        <form className="grid gap-3 md:grid-cols-3 lg:grid-cols-5" method="get">
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos os status</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {approvalStatusLabel[value]}
              </option>
            ))}
          </Select>
          <Select name="kind" defaultValue={filters.kind ?? ""}>
            <option value="">Todos os tipos</option>
            {kinds.map((value) => (
              <option key={value} value={value}>
                {approvalKindLabel[value]}
              </option>
            ))}
          </Select>
          <Select name="projectId" defaultValue={filters.projectId ?? ""}>
            <option value="">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select name="clientId" defaultValue={filters.clientId ?? ""}>
            <option value="">Todos os clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <Button type="submit">Filtrar</Button>
        </form>
      </Card>

      {loadError ? (
        <p className="text-sm text-semantic-red">{APPROVALS_LOAD_ERROR}</p>
      ) : approvals.length === 0 ? (
        <p className="text-sm text-notes-muted">{APPROVALS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <a href={approvalHref(approval.id)} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={approvalStatusTone[approval.status]}>
                    {approvalStatusLabel[approval.status]}
                  </StatusPill>
                  <h3 className="font-display text-xl">{approvalKindLabel[approval.kind]}</h3>
                </div>
                <p className="text-sm text-notes-muted">
                  {approval.projectName} · {approval.clientName}
                  {approval.approverName ? ` · ${approval.approverName}` : ""}
                </p>
              </a>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
