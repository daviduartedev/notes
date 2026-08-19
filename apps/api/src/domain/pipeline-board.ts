import { projectVisualState } from "./overdue.js";
import { SAAS_DELIVERY_STAGES } from "./saas-delivery-template.js";
import type { ProjectPriority, ProjectStatus, StageStatus } from "./types.js";

export const PIPELINE_BOARD_STATUSES: readonly ProjectStatus[] = [
  "draft",
  "active",
  "on_hold",
];

export type PipelineCardRow = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  ownerUserId: string;
  ownerName: string;
  dueDate: Date | null;
  priority: ProjectPriority;
  status: ProjectStatus;
  currentStageKey: string;
  currentStageLabel: string;
  stageStatus: StageStatus;
  openBlockerCount: number;
  waitingOnClient: boolean;
};

export type PipelineCardDto = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  ownerUserId: string;
  ownerName: string;
  dueDate: string | null;
  priority: ProjectPriority;
  status: ProjectStatus;
  currentStageKey: string;
  currentStageLabel: string;
  stageStatus: StageStatus;
  visualState: "overdue" | null;
  openBlockerCount: number;
  waitingOnClient: boolean;
};

export type PipelineColumnDto = {
  key: string;
  label: string;
  order: number;
  projects: PipelineCardDto[];
};

export type PipelineBoardDto = {
  columns: PipelineColumnDto[];
};

export function comparePipelineCards(a: PipelineCardRow, b: PipelineCardRow): number {
  if (a.dueDate && b.dueDate) {
    const diff = a.dueDate.getTime() - b.dueDate.getTime();
    if (diff !== 0) {
      return diff;
    }
  } else if (a.dueDate && !b.dueDate) {
    return -1;
  } else if (!a.dueDate && b.dueDate) {
    return 1;
  }
  return a.name.localeCompare(b.name, "pt-BR");
}

export function serializePipelineCard(row: PipelineCardRow, now: Date): PipelineCardDto {
  return {
    id: row.id,
    name: row.name,
    clientId: row.clientId,
    clientName: row.clientName,
    ownerUserId: row.ownerUserId,
    ownerName: row.ownerName,
    dueDate: row.dueDate?.toISOString() ?? null,
    priority: row.priority,
    status: row.status,
    currentStageKey: row.currentStageKey,
    currentStageLabel: row.currentStageLabel,
    stageStatus: row.stageStatus,
    visualState: projectVisualState(row.status, row.dueDate, now),
    openBlockerCount: row.openBlockerCount,
    waitingOnClient: row.waitingOnClient,
  };
}

export function buildPipelineBoard(rows: PipelineCardRow[], now: Date): PipelineBoardDto {
  const columns: PipelineColumnDto[] = SAAS_DELIVERY_STAGES.map((stage) => ({
    key: stage.key,
    label: stage.label,
    order: stage.order,
    projects: [],
  }));
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const sorted = [...rows].sort(comparePipelineCards);
  for (const row of sorted) {
    const column = byKey.get(row.currentStageKey);
    if (!column) {
      continue;
    }
    column.projects.push(serializePipelineCard(row, now));
  }
  return { columns };
}
