import type { ReminderStatus } from "./reminder-status.js";
import { DAY_MS, isActiveReminderStatus, promoteScheduledIfDue } from "./reminder-status.js";

export const PROPOSAL_WAITING_CLIENT_POLICY = "proposalWaitingClientFollowUp";
export const FOLLOW_UP_THRESHOLD_MS = 3 * DAY_MS;
export const WAITING_CLIENT_STAGE_KEY = "waiting_client";

export type FollowUpProject = {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  clientName: string;
  currentStageKey: string | null;
  lastInteractionAt: Date | null;
  createdAt: Date;
};

export type ExistingFollowUpReminder = {
  id: string;
  projectId: string | null;
  policyKey: string | null;
  status: ReminderStatus;
  dueAt: Date;
};

export type FollowUpCreate = {
  workspaceId: string;
  projectId: string;
  clientId: string;
  subjectType: "project";
  subjectId: string;
  channel: "internal";
  policyKey: typeof PROPOSAL_WAITING_CLIENT_POLICY;
  status: ReminderStatus;
  dueAt: Date;
  draftMessage: string;
};

export function proposalFollowUpDraft(clientName: string, projectName: string): string {
  const client = clientName.trim() || "cliente";
  const project = projectName.trim() || "projeto";
  return `Olá, ${client}. Passando para acompanhar a proposta do projeto ${project}. Podemos alinhar os próximos passos?`;
}

export function lastInteractionOf(project: FollowUpProject): Date {
  return project.lastInteractionAt ?? project.createdAt;
}

export function shouldCreateProposalFollowUp(
  project: FollowUpProject,
  existing: readonly ExistingFollowUpReminder[],
  now: Date,
): boolean {
  if (project.currentStageKey !== WAITING_CLIENT_STAGE_KEY) {
    return false;
  }
  const last = lastInteractionOf(project);
  if (now.getTime() - last.getTime() < FOLLOW_UP_THRESHOLD_MS) {
    return false;
  }
  return !existing.some(
    (row) =>
      row.projectId === project.id &&
      row.policyKey === PROPOSAL_WAITING_CLIENT_POLICY &&
      isActiveReminderStatus(row.status),
  );
}

export function evaluateFollowUpPolicies(input: {
  now: Date;
  projects: readonly FollowUpProject[];
  existing: readonly ExistingFollowUpReminder[];
}): { create: FollowUpCreate[]; promoteIds: string[] } {
  const promoteIds = input.existing
    .filter((row) => promoteScheduledIfDue(row.status, row.dueAt, input.now) === "due" && row.status === "scheduled")
    .map((row) => row.id);

  const create: FollowUpCreate[] = [];
  for (const project of input.projects) {
    if (!shouldCreateProposalFollowUp(project, input.existing, input.now)) {
      continue;
    }
    const last = lastInteractionOf(project);
    const dueAt = new Date(last.getTime() + FOLLOW_UP_THRESHOLD_MS);
    const status = promoteScheduledIfDue("scheduled", dueAt, input.now);
    create.push({
      workspaceId: project.workspaceId,
      projectId: project.id,
      clientId: project.clientId,
      subjectType: "project",
      subjectId: project.id,
      channel: "internal",
      policyKey: PROPOSAL_WAITING_CLIENT_POLICY,
      status,
      dueAt,
      draftMessage: proposalFollowUpDraft(project.clientName, project.name),
    });
  }
  return { create, promoteIds };
}
