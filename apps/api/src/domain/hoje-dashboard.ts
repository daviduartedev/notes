import type {
  ApprovalRecord,
  BlockerRecord,
  MeetingRecord,
  ReminderRecord,
  ValidationRecord,
} from "../store/types.js";
import { FOLLOW_UP_THRESHOLD_MS, PROPOSAL_WAITING_CLIENT_POLICY, WAITING_CLIENT_STAGE_KEY } from "./follow-up-policy.js";
import { projectVisualState } from "./overdue.js";
import { comparePipelineCards, type PipelineCardRow } from "./pipeline-board.js";
import { isTerminalValidationStatus } from "./validation-status.js";

export const HOJE_SECTION_LIMIT = 20;

export type HojeCardKind = "project" | "validation" | "blocker" | "approval" | "reminder" | "meeting";

export type HojeCard = {
  id: string;
  kind: HojeCardKind;
  clientName: string;
  projectName: string;
  reason: string;
  since: string;
  nextAction: string;
  href: string;
};

export type HojeDashboard = {
  needs_attention: HojeCard[];
  today: HojeCard[];
  waiting_client: HojeCard[];
  in_progress: HojeCard[];
};

export type HojeDashboardInput = {
  now: Date;
  pipeline: readonly PipelineCardRow[];
  validations: readonly ValidationRecord[];
  approvals: readonly ApprovalRecord[];
  blockers: readonly BlockerRecord[];
  reminders: readonly ReminderRecord[];
  meetings: readonly MeetingRecord[];
};

function utcDayKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isSameUtcDay(value: Date, now: Date): boolean {
  return utcDayKey(value) === utcDayKey(now);
}

function bySince(a: HojeCard, b: HojeCard): number {
  const diff = a.since.localeCompare(b.since);
  if (diff !== 0) {
    return diff;
  }
  return a.id.localeCompare(b.id);
}

function takeSection(cards: HojeCard[]): HojeCard[] {
  const unique = new Map<string, HojeCard>();
  for (const card of cards) {
    if (!unique.has(card.id)) {
      unique.set(card.id, card);
    }
  }
  return [...unique.values()].sort(bySince).slice(0, HOJE_SECTION_LIMIT);
}

function projectHref(id: string): string {
  return `/projetos/${id}`;
}

export function buildHojeDashboard(input: HojeDashboardInput): HojeDashboard {
  const { now } = input;
  const needsAttention: HojeCard[] = [];
  const today: HojeCard[] = [];
  const waitingClient: HojeCard[] = [];

  for (const row of input.pipeline) {
    if (projectVisualState(row.status, row.dueDate, now) === "overdue" && row.dueDate) {
      needsAttention.push({
        id: `project:${row.id}`,
        kind: "project",
        clientName: row.clientName,
        projectName: row.name,
        reason: "Projeto atrasado",
        since: row.dueDate.toISOString(),
        nextAction: "Abrir projeto",
        href: projectHref(row.id),
      });
    }
    const waitingByKey = row.currentStageKey === WAITING_CLIENT_STAGE_KEY;
    const waitingByStatus = row.stageStatus === "waiting";
    if (waitingByKey || waitingByStatus) {
      waitingClient.push({
        id: `project:${row.id}`,
        kind: "project",
        clientName: row.clientName,
        projectName: row.name,
        reason: waitingByKey ? "Aguardando cliente" : "Etapa aguardando",
        since: row.dueDate?.toISOString() ?? now.toISOString(),
        nextAction: "Abrir projeto",
        href: projectHref(row.id),
      });
    }
  }

  for (const row of input.validations) {
    const overdue = !isTerminalValidationStatus(row.status) && row.dueDate !== null && row.dueDate.getTime() < now.getTime();
    if (overdue && row.dueDate) {
      needsAttention.push({
        id: `validation:${row.id}`,
        kind: "validation",
        clientName: row.clientName,
        projectName: row.projectName,
        reason: "Validação atrasada",
        since: row.dueDate.toISOString(),
        nextAction: "Abrir validação",
        href: `/validacoes/${row.id}`,
      });
    }
    if (row.status === "requested") {
      waitingClient.push({
        id: `validation:${row.id}`,
        kind: "validation",
        clientName: row.clientName,
        projectName: row.projectName,
        reason: "Validação solicitada",
        since: (row.requestedAt ?? row.createdAt).toISOString(),
        nextAction: "Abrir validação",
        href: `/validacoes/${row.id}`,
      });
    }
  }

  for (const row of input.blockers) {
    if (row.status === "open" && row.dueDate !== null && row.dueDate.getTime() < now.getTime()) {
      needsAttention.push({
        id: `blocker:${row.id}`,
        kind: "blocker",
        clientName: row.clientName,
        projectName: row.projectName,
        reason: "Pendência atrasada",
        since: row.dueDate.toISOString(),
        nextAction: "Abrir pendência",
        href: `/pendencias/${row.id}`,
      });
    }
    if (row.status === "open" && row.assigneeKind === "client") {
      waitingClient.push({
        id: `blocker:${row.id}`,
        kind: "blocker",
        clientName: row.clientName,
        projectName: row.projectName,
        reason: "Pendência com o cliente",
        since: row.openedAt.toISOString(),
        nextAction: "Abrir pendência",
        href: `/pendencias/${row.id}`,
      });
    }
  }

  for (const row of input.approvals) {
    if (row.status === "pending" && now.getTime() - row.createdAt.getTime() >= FOLLOW_UP_THRESHOLD_MS) {
      needsAttention.push({
        id: `approval:${row.id}`,
        kind: "approval",
        clientName: row.clientName,
        projectName: row.projectName,
        reason: "Aprovação pendente há tempo",
        since: row.createdAt.toISOString(),
        nextAction: "Abrir aprovação",
        href: `/aprovacoes/${row.id}`,
      });
    }
  }

  for (const row of input.reminders) {
    const isFollowUp = row.policyKey === PROPOSAL_WAITING_CLIENT_POLICY && row.status === "due";
    const dueToday = row.status === "due" && isSameUtcDay(row.dueAt, now);
    if (dueToday || isFollowUp) {
      today.push({
        id: `reminder:${row.id}`,
        kind: "reminder",
        clientName: row.clientName,
        projectName: row.projectName ?? "",
        reason: isFollowUp ? "Follow-up de proposta" : "Lembrete para hoje",
        since: row.dueAt.toISOString(),
        nextAction: "Abrir lembrete",
        href: `/lembretes/${row.id}`,
      });
    }
    if (isFollowUp) {
      waitingClient.push({
        id: `reminder:${row.id}`,
        kind: "reminder",
        clientName: row.clientName,
        projectName: row.projectName ?? "",
        reason: "Follow-up de proposta",
        since: row.dueAt.toISOString(),
        nextAction: "Abrir lembrete",
        href: `/lembretes/${row.id}`,
      });
    }
  }

  for (const row of input.meetings) {
    if (!isSameUtcDay(row.startsAt, now)) {
      continue;
    }
    today.push({
      id: `meeting:${row.id}`,
      kind: "meeting",
      clientName: row.clientName ?? "",
      projectName: row.projectName ?? "",
      reason: "Reunião hoje",
      since: row.startsAt.toISOString(),
      nextAction: "Abrir reunião",
      href: `/reunioes/${row.id}`,
    });
  }

  const inProgress = [...input.pipeline]
    .sort(comparePipelineCards)
    .slice(0, HOJE_SECTION_LIMIT)
    .map((row) => ({
      id: `project:${row.id}`,
      kind: "project" as const,
      clientName: row.clientName,
      projectName: row.name,
      reason: `Etapa atual: ${row.currentStageLabel}`,
      since: row.dueDate?.toISOString() ?? now.toISOString(),
      nextAction: "Abrir projeto",
      href: projectHref(row.id),
    }));

  return {
    needs_attention: takeSection(needsAttention),
    today: takeSection(today),
    waiting_client: takeSection(waitingClient),
    in_progress: inProgress,
  };
}
