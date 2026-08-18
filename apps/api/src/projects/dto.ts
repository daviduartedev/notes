import { projectVisualState } from "../domain/overdue.js";
import type { ProjectRecord } from "../store/types.js";

export function serializeProject(
  row: ProjectRecord,
  clientName: string,
  now: Date,
) {
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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
