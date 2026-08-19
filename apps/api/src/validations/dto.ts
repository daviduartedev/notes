import { validationVisualState } from "../domain/overdue.js";
import { listAllowedValidationStatuses } from "../domain/validation-status.js";
import type { ValidationRecord } from "../store/types.js";

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeValidation(row: ValidationRecord, now: Date) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.projectName,
    clientId: row.clientId,
    clientName: row.clientName,
    stageId: row.stageId,
    type: row.type,
    reviewerUserId: row.reviewerUserId,
    reviewerName: row.reviewerName,
    requesterUserId: row.requesterUserId,
    requesterName: row.requesterName,
    environment: row.environment,
    status: row.status,
    requestedAt: iso(row.requestedAt),
    dueDate: iso(row.dueDate),
    notes: row.notes,
    items: row.items,
    resultNotes: row.resultNotes,
    checklistId: row.checklistId,
    visualState: validationVisualState(row.status, row.dueDate, now),
    allowedTransitions: listAllowedValidationStatuses(row.status),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
