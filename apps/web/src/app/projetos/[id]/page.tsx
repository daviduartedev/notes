import { ActivityList } from "@/components/activity-list";
import { AppShell } from "@/components/app-shell";
import { ProjectApprovals } from "@/components/project-approvals";
import { ProjectBlockers } from "@/components/project-blockers";
import { ProjectChecklists } from "@/components/project-checklists";
import { ProjectEditForm } from "@/components/project-edit-form";
import { ProjectReminders } from "@/components/project-reminders";
import { ProjectMeetings } from "@/components/project-meetings";
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
  ReminderDto,
  MeetingDto,
  ValidationDto,
} from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel, stageKeyLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { projectStatusTone } from "@/lib/status-tone";

export default async function ProjetoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, membersRes, clientsRes, activityRes, templatesRes, checklistsRes, validationsRes, approvalsRes, blockersRes, remindersRes, meetingsRes] =
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
    serverApi<ReminderDto[]>(`/api/projects/${id}/reminders`),
    serverApi<MeetingDto[]>(`/api/projects/${id}/meetings`),
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
  const reminders = remindersRes.status === 200 && remindersRes.data ? remindersRes.data : [];
  const meetings = meetingsRes.status === 200 && meetingsRes.data ? meetingsRes.data : [];
  const projectClient = project ? clients.find((item) => item.id === project.clientId) ?? null : null;

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
            <p className="text-sm text-notes-muted">
              {project.progress}% · {project.clientName}
              {project.currentStageKey
                ? ` · ${stageKeyLabel[project.currentStageKey] ?? project.currentStageKey}`
                : ""}
            </p>
          </div>
          <ProjectEditForm project={project} members={members} clients={clients} />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Etapas</h3>
          <StageBoard project={project} />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Checklists</h3>
          <ProjectChecklists project={project} templates={templates} checklists={checklists} />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Validações</h3>
          <ProjectValidations
            project={project}
            members={members}
            checklists={checklists}
            validations={validations}
          />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Aprovações</h3>
          <ProjectApprovals project={project} approvals={approvals} />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Pendências</h3>
          <ProjectBlockers project={project} members={members} blockers={blockers} />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Lembretes</h3>
          {projectClient ? (
            <ProjectReminders
              reminders={reminders}
              client={projectClient}
              project={project}
            />
          ) : (
            <p className="text-sm text-notes-muted">Cliente do projeto não encontrado.</p>
          )}
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Reuniões</h3>
          <ProjectMeetings
            project={project}
            members={members}
            validations={validations}
            meetings={meetings}
          />
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-semibold">Histórico</h3>
          <ActivityList events={events} />
        </Card>
        </>
      )}
    </AppShell>
  );
}
