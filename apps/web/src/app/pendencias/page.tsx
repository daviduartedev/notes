import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import {
  BLOCKERS_EMPTY,
  BLOCKERS_LOAD_ERROR,
  WAITING_ON_CLIENT_COPY,
  blockerHref,
} from "@/lib/blocker-copy";
import type {
  BlockerAssigneeKind,
  BlockerDto,
  BlockerStatus,
  ClientDto,
  ProjectDto,
} from "@/lib/domain-types";
import { blockerAssigneeKindLabel, blockerStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { blockerStatusTone } from "@/lib/status-tone";

const statuses: BlockerStatus[] = ["open", "resolved", "cancelled"];
const kinds: BlockerAssigneeKind[] = ["internal", "client"];

export default async function PendenciasPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    assigneeKind?: string;
    projectId?: string;
    clientId?: string;
    blocking?: string;
    overdue?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.assigneeKind) params.set("assigneeKind", filters.assigneeKind);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.blocking) params.set("blocking", filters.blocking);
  if (filters.overdue) params.set("overdue", filters.overdue);
  const query = params.toString();

  const [blockersRes, clientsRes, projectsRes] = await Promise.all([
    serverApi<BlockerDto[]>(`/api/blockers${query ? `?${query}` : ""}`),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ProjectDto[]>("/api/projects"),
  ]);
  const blockers = blockersRes.status === 200 && blockersRes.data ? blockersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const loadError = blockersRes.status !== 200;

  return (
    <AppShell title="Pendências" pathname="/pendencias">
      <Card>
        <FilterBar method="get">
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos os status</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {blockerStatusLabel[value]}
              </option>
            ))}
          </Select>
          <Select name="assigneeKind" defaultValue={filters.assigneeKind ?? ""}>
            <option value="">Todos os responsáveis</option>
            {kinds.map((value) => (
              <option key={value} value={value}>
                {blockerAssigneeKindLabel[value]}
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
          <Select name="blocking" defaultValue={filters.blocking ?? ""}>
            <option value="">Bloqueio qualquer</option>
            <option value="true">Bloqueando etapa/projeto</option>
          </Select>
          <Select name="overdue" defaultValue={filters.overdue ?? ""}>
            <option value="">Prazo qualquer</option>
            <option value="true">Atrasadas</option>
          </Select>
          <Button type="submit">Filtrar</Button>
        </FilterBar>
      </Card>

      {loadError ? (
        <p className="text-sm text-semantic-red">{BLOCKERS_LOAD_ERROR}</p>
      ) : blockers.length === 0 ? (
        <p className="text-sm text-notes-muted">{BLOCKERS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {blockers.map((blocker) => (
            <Card key={blocker.id}>
              <a href={blockerHref(blocker.id)} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={blockerStatusTone[blocker.status]}>
                    {blockerStatusLabel[blocker.status]}
                  </StatusPill>
                  {blocker.waitingOnClient ? (
                    <StatusPill tone="yellow">{WAITING_ON_CLIENT_COPY}</StatusPill>
                  ) : null}
                  {blocker.visualState === "overdue" ? (
                    <StatusPill tone="red">Atrasada</StatusPill>
                  ) : null}
                  <h3 className="text-xl font-semibold">{blocker.title}</h3>
                </div>
                <p className="text-sm text-notes-muted">
                  {blocker.projectName} · {blocker.clientName}
                  {blocker.assigneeName ? ` · ${blocker.assigneeName}` : ""}
                </p>
              </a>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
