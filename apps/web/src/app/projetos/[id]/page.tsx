import { ActivityList } from "@/components/activity-list";
import { AppShell } from "@/components/app-shell";
import { ProjectEditForm } from "@/components/project-edit-form";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { ActivityDto, ClientDto, MemberDto, ProjectDto } from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { projectStatusTone } from "@/lib/status-tone";

export default async function ProjetoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, membersRes, clientsRes, activityRes] = await Promise.all([
    serverApi<ProjectDto>(`/api/projects/${id}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ActivityDto[]>(`/api/projects/${id}/activity`),
  ]);
  const project = detail.status === 200 ? detail.data : null;
  const members = membersRes.status === 200 && membersRes.data ? membersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const events = activityRes.status === 200 && activityRes.data ? activityRes.data : [];

  return (
    <AppShell title={project?.name ?? "Projeto"} pathname="/projetos">
      {!project ? (
        <p className="text-sm text-semantic-red">Projeto não encontrado</p>
      ) : (
        <>
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {project.visualState === "overdue" ? (
              <StatusPill tone="red">Atrasado</StatusPill>
            ) : null}
            <StatusPill tone={projectStatusTone[project.status]}>
              {projectStatusLabel[project.status]}
            </StatusPill>
            <StatusPill tone="purple">{projectPriorityLabel[project.priority]}</StatusPill>
            <p className="text-sm text-notes-muted">{project.progress}% · {project.clientName}</p>
          </div>
          <ProjectEditForm project={project} members={members} clients={clients} />
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
