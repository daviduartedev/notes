import { ActivityList } from "@/components/activity-list";
import { AppShell } from "@/components/app-shell";
import { ProjectApprovals } from "@/components/project-approvals";
import { ProjectBlockers } from "@/components/project-blockers";
import { ProjectChecklists } from "@/components/project-checklists";
import { ProjectEditForm } from "@/components/project-edit-form";
import { ProjectValidations } from "@/components/project-validations";
import { StageBoard } from "@/components/stage-board";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  ActivityDto,
  ApprovalDto,
  BlockerDto,
  ChecklistTemplateDto,
  ClientDto,
  MemberDto,
  ProjectChecklistDto,
  ProjectDto,
  ValidationDto,
} from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { projectStatusTone } from "@/lib/status-tone";

export default async function ProjetoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, membersRes, clientsRes, activityRes, templatesRes, checklistsRes, validationsRes, approvalsRes, blockersRes] =
    await Promise.all([
    serverApi<ProjectDto>(`/api/projects/${id}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ActivityDto[]>(`/api/projects/${id}/activity`),
    serverApi<ChecklistTemplateDto[]>("/api/checklist-templates"),
    serverApi<ProjectChecklistDto[]>(`/api/projects/${id}/checklists`),
    serverApi<ValidationDto[]>(`/api/projects/${id}/validations`),
    serverApi<ApprovalDto[]>(`/api/projects/${id}/approvals`),
    serverApi<BlockerDto[]>(`/api/projects/${id}/blockers`),
  ]);
  const project = detail.status === 200 ? detail.data : null;
  const members = membersRes.status === 200 && membersRes.data ? membersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const events = activityRes.status === 200 && activityRes.data ? activityRes.data : [];
  const templates = templatesRes.status === 200 && templatesRes.data ? templatesRes.data : [];
  const checklists = checklistsRes.status === 200 && checklistsRes.data ? checklistsRes.data : [];
  const validations = validationsRes.status === 200 && validationsRes.data ? validationsRes.data : [];
  const approvals = approvalsRes.status === 200 && approvalsRes.data ? approvalsRes.data : [];
  const blockers = blockersRes.status === 200 && blockersRes.data ? blockersRes.data : [];

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
            {(project.openBlockerCount ?? 0) > 0 ? (
              <StatusPill tone="red">Pendência</StatusPill>
            ) : null}
            {project.waitingOnClient ? (
              <StatusPill tone="yellow">Aguardando cliente</StatusPill>
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
          <h3 className="mb-4 font-display text-xl">Etapas</h3>
          <StageBoard project={project} />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-xl">Checklists</h3>
          <ProjectChecklists project={project} templates={templates} checklists={checklists} />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-xl">Validações</h3>
          <ProjectValidations
            project={project}
            members={members}
            checklists={checklists}
            validations={validations}
          />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-xl">Aprovações</h3>
          <ProjectApprovals project={project} approvals={approvals} />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-xl">Pendências</h3>
          <ProjectBlockers project={project} members={members} blockers={blockers} />
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
