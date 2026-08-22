import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  ClientDto,
  MemberDto,
  ProjectDto,
  ValidationDto,
  ValidationStatus,
} from "@/lib/domain-types";
import { validationStatusLabel, validationTypeLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { validationStatusTone } from "@/lib/status-tone";
import {
  VALIDATIONS_EMPTY,
  VALIDATIONS_LOAD_ERROR,
  validationHref,
} from "@/lib/validation-copy";

const statuses: ValidationStatus[] = [
  "draft",
  "requested",
  "in_review",
  "changes_requested",
  "approved",
  "rejected",
  "cancelled",
];

export default async function ValidacoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    projectId?: string;
    clientId?: string;
    reviewerUserId?: string;
    dueBefore?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.reviewerUserId) params.set("reviewerUserId", filters.reviewerUserId);
  if (filters.dueBefore) params.set("dueBefore", filters.dueBefore);
  const query = params.toString();

  const [validationsRes, membersRes, clientsRes, projectsRes] = await Promise.all([
    serverApi<ValidationDto[]>(`/api/validations${query ? `?${query}` : ""}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ProjectDto[]>("/api/projects"),
  ]);
  const validations = validationsRes.status === 200 && validationsRes.data ? validationsRes.data : [];
  const members = membersRes.status === 200 && membersRes.data ? membersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const loadError = validationsRes.status !== 200;

  return (
    <AppShell title="Validações" pathname="/validacoes">
      <Card>
        <FilterBar method="get">
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos os status</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {validationStatusLabel[value]}
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
          <Select name="reviewerUserId" defaultValue={filters.reviewerUserId ?? ""}>
            <option value="">Todos os responsáveis</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
              </option>
            ))}
          </Select>
          <Input name="dueBefore" type="date" defaultValue={filters.dueBefore ?? ""} />
          <Button type="submit">Filtrar</Button>
        </FilterBar>
      </Card>

      {loadError ? (
        <p className="text-sm text-semantic-red">{VALIDATIONS_LOAD_ERROR}</p>
      ) : validations.length === 0 ? (
        <p className="text-sm text-notes-muted">{VALIDATIONS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {validations.map((validation) => (
            <Card key={validation.id}>
              <a href={validationHref(validation.id)} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {validation.visualState === "overdue" ? (
                    <StatusPill tone="red">Atrasada</StatusPill>
                  ) : null}
                  <StatusPill tone={validationStatusTone[validation.status]}>
                    {validationStatusLabel[validation.status]}
                  </StatusPill>
                  <h3 className="text-xl font-semibold">{validationTypeLabel[validation.type]}</h3>
                </div>
                <p className="text-sm text-notes-muted">
                  {validation.projectName} · {validation.clientName}
                  {validation.reviewerName ? ` · ${validation.reviewerName}` : ""}
                </p>
              </a>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
