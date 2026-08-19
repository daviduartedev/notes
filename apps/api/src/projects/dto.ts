import { projectVisualState } from "../domain/overdue.js";
import type { OpenBlockerHint } from "../domain/blocker-status.js";
import { listStageActions } from "../domain/stage-transition.js";
import type { StageSnapshot } from "../domain/stage-instance.js";
import type { ProjectRecord, StageRecord } from "../store/types.js";

export function toStageSnapshot(row: StageRecord): StageSnapshot {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    phase: row.phase,
    order: row.order,
    allowedNextKeys: [...row.allowedNextKeys],
    entryCriteria: row.entryCriteria,
    exitCriteria: row.exitCriteria,
    status: row.status,
  };
}

export function serializeStage(
  row: StageRecord,
  stages: StageRecord[],
  currentStageId: string | null,
  openBlockers: readonly OpenBlockerHint[] = [],
) {
  const snapshots = stages.map(toStageSnapshot);
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    phase: row.phase,
    order: row.order,
    allowedNextKeys: row.allowedNextKeys,
    entryCriteria: row.entryCriteria,
    exitCriteria: row.exitCriteria,
    status: row.status,
    isCurrent: row.id === currentStageId,
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    actions: listStageActions({
      stage: toStageSnapshot(row),
      stages: snapshots,
      currentStageId,
      openBlockers,
    }),
  };
}

export function serializeProject(
  row: ProjectRecord,
  clientName: string,
  now: Date,
  stages?: StageRecord[],
  openBlockers: readonly OpenBlockerHint[] = [],
  waitingOnClient = false,
) {
  const current = stages?.find((stage) => stage.id === row.currentStageId);
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    clientId: row.clientId,
    clientName,
    name: row.name,
    description: row.description,
    ownerUserId: row.ownerUserId,
    status: row.status,
    startDate: row.startDate?.toISOString() ?? null,
    dueDate: row.dueDate?.toISOString() ?? null,
    priority: row.priority,
    progress: row.progress,
    notes: row.notes,
    visualState: projectVisualState(row.status, row.dueDate, now),
    workflowTemplateId: row.workflowTemplateId,
    currentStageId: row.currentStageId,
    currentStageKey: current?.key ?? null,
    openBlockerCount: openBlockers.length,
    waitingOnClient,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(stages
      ? { stages: stages.map((stage) => serializeStage(stage, stages, row.currentStageId, openBlockers)) }
      : {}),
  };
}
