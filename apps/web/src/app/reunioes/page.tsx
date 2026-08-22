import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import type { ClientDto, MeetingDto, MeetingType, ProjectDto } from "@/lib/domain-types";
import { meetingTypeLabel } from "@/lib/labels";
import { MEETINGS_EMPTY, MEETINGS_LOAD_ERROR, meetingHref } from "@/lib/meeting-copy";
import { serverApi } from "@/lib/server-api";
import { meetingTypeTone } from "@/lib/status-tone";

const types: MeetingType[] = [
  "kickoff",
  "scope_alignment",
  "prototype_review",
  "staging_validation",
  "production_validation",
  "delivery",
];

export default async function ReunioesPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    projectId?: string;
    clientId?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  const query = params.toString();

  const [meetingsRes, clientsRes, projectsRes] = await Promise.all([
    serverApi<MeetingDto[]>(`/api/meetings${query ? `?${query}` : ""}`),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ProjectDto[]>("/api/projects"),
  ]);
  const meetings = meetingsRes.status === 200 && meetingsRes.data ? meetingsRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const loadError = meetingsRes.status !== 200;

  return (
    <AppShell title="Reuniões" pathname="/reunioes">
      <Card>
        <FilterBar method="get">
          <Select name="type" defaultValue={filters.type ?? ""}>
            <option value="">Todos os tipos</option>
            {types.map((value) => (
              <option key={value} value={value}>
                {meetingTypeLabel[value]}
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
        </FilterBar>
      </Card>

      {loadError ? (
        <p className="text-sm text-semantic-red">{MEETINGS_LOAD_ERROR}</p>
      ) : meetings.length === 0 ? (
        <p className="text-sm text-notes-muted">{MEETINGS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <a href={meetingHref(meeting.id)} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={meetingTypeTone[meeting.type]}>
                    {meetingTypeLabel[meeting.type]}
                  </StatusPill>
                  <h3 className="text-xl font-semibold">{meeting.title}</h3>
                </div>
                <p className="text-sm text-notes-muted">
                  {meeting.projectName ?? "Sem projeto"} · {meeting.clientName ?? "Sem cliente"}
                </p>
              </a>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
