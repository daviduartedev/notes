import { ActivityList } from "@/components/activity-list";
import { AppShell } from "@/components/app-shell";
import { ClientEditForm } from "@/components/client-edit-form";
import { ProjectCreateForm } from "@/components/project-create-form";
import { ProjectList } from "@/components/project-list";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { ActivityDto, ClientDto, MemberDto, ProjectDto } from "@/lib/domain-types";
import { clientStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { clientStatusTone } from "@/lib/status-tone";

export default async function ClienteFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, memberList, projectsRes, activityRes] = await Promise.all([
    serverApi<ClientDto>(`/api/clients/${id}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
    serverApi<ProjectDto[]>(`/api/projects?clientId=${id}`),
    serverApi<ActivityDto[]>(`/api/clients/${id}/activity`),
  ]);
  const client = detail.status === 200 ? detail.data : null;
  const members = memberList.status === 200 && memberList.data ? memberList.data : [];
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const events = activityRes.status === 200 && activityRes.data ? activityRes.data : [];

  return (
    <AppShell title={client?.name ?? "Cliente"} pathname="/clientes">
      {!client ? (
        <p className="text-sm text-semantic-red">Cliente não encontrado</p>
      ) : (
        <>
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <StatusPill tone={clientStatusTone[client.status]}>
                {clientStatusLabel[client.status]}
              </StatusPill>
              <p className="text-sm text-notes-muted">
                Criado em {new Date(client.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <ClientEditForm client={client} members={members} />
          </Card>
          <Card>
            <h3 className="font-display text-xl">Projetos</h3>
            <div className="mt-4">
              <ProjectList projects={projects} />
            </div>
            <h3 className="mt-6 font-display text-xl">Novo projeto neste cliente</h3>
            <ProjectCreateForm members={members} clients={[client]} defaultClientId={client.id} />
          </Card>
          <Card>
            <h3 className="mb-4 font-display text-xl">Histórico</h3>
            <ActivityList events={events} />
          </Card>
        </>
      )}
    </AppShell>
  );
}
