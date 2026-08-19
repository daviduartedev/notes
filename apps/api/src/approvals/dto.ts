import { listAllowedApprovalActions } from "../domain/approval-status.js";
import type { ApprovalRecord } from "../store/types.js";

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeApproval(row: ApprovalRecord) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.projectName,
    clientId: row.clientId,
    clientName: row.clientName,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    kind: row.kind,
    status: row.status,
    validationId: row.validationId,
    approverId: row.approverId,
    approverName: row.approverName,
    decidedAt: iso(row.decidedAt),
    revokedAt: iso(row.revokedAt),
    comment: row.comment,
    projectSnapshot: row.projectSnapshot,
    allowedActions: listAllowedApprovalActions(row.status),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
