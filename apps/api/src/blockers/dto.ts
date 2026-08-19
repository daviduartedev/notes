import {
  blockerVisualState,
  listAllowedBlockerActions,
  WAITING_ON_CLIENT_COPY,
} from "../domain/blocker-status.js";
import type { BlockerRecord } from "../store/types.js";

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeBlocker(row: BlockerRecord, now: Date) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.projectName,
    clientId: row.clientId,
    clientName: row.clientName,
    title: row.title,
    assigneeKind: row.assigneeKind,
    assigneeUserId: row.assigneeUserId,
    assigneeName: row.assigneeName,
    waitingOnClient: row.assigneeKind === "client",
    waitingOnClientCopy: row.assigneeKind === "client" ? WAITING_ON_CLIENT_COPY : null,
    blocksStageId: row.blocksStageId,
    blocksProject: row.blocksProject,
    status: row.status,
    dueDate: iso(row.dueDate),
    openedAt: row.openedAt.toISOString(),
    resolvedAt: iso(row.resolvedAt),
    cancelledAt: iso(row.cancelledAt),
    sourceMeetingId: row.sourceMeetingId,
    notes: row.notes,
    visualState: blockerVisualState(row.status, row.dueDate, now),
    allowedActions: listAllowedBlockerActions(row.status),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
