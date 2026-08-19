import { AppShell } from "@/components/app-shell";
import { ProjectCreateForm } from "@/components/project-create-form";
import { ProjectList } from "@/components/project-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  ClientDto,
  MemberDto,
  ProjectDto,
  ProjectPriority,
  ProjectStatus,
  WorkflowTemplateDto,
} from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";

const statuses: ProjectStatus[] = ["draft", "active", "on_hold", "completed", "cancelled"];
const priorities: ProjectPriority[] = ["low", "medium", "high", "urgent"];

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{
    ownerUserId?: string;
    status?: string;
    clientId?: string;
    dueBefore?: string;
    priority?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.ownerUserId) params.set("ownerUserId", filters.ownerUserId);
  if (filters.status) params.set("status", filters.status);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.dueBefore) params.set("dueBefore", filters.dueBefore);
  if (filters.priority) params.set("priority", filters.priority);
  const query = params.toString();

  const [projectsRes, membersRes, clientsRes, templatesRes] = await Promise.all([
    serverApi<ProjectDto[]>(`/api/projects${query ? `?${query}` : ""}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<WorkflowTemplateDto[]>("/api/workflow-templates"),
  ]);
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const members = membersRes.status === 200 && membersRes.data ? membersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const templates = templatesRes.status === 200 && templatesRes.data ? templatesRes.data : [];

  return (
    <AppShell title="Projetos" pathname="/projetos">
      <Card>
        <form className="grid gap-3 md:grid-cols-3 lg:grid-cols-6" method="get">
          <Select name="ownerUserId" defaultValue={filters.ownerUserId ?? ""}>
            <option value="">Todos os responsáveis</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos os status</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {projectStatusLabel[value]}
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
          <Select name="priority" defaultValue={filters.priority ?? ""}>
            <option value="">Todas as prioridades</option>
            {priorities.map((value) => (
              <option key={value} value={value}>
                {projectPriorityLabel[value]}
              </option>
            ))}
          </Select>
          <Input name="dueBefore" type="date" defaultValue={filters.dueBefore ?? ""} />
          <Button type="submit">Filtrar</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-display text-xl">Novo projeto</h3>
        <ProjectCreateForm members={members} clients={clients} templates={templates} />
      </Card>

      <ProjectList projects={projects} />
    </AppShell>
  );
}
