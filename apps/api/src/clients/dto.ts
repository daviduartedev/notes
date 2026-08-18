import type { ClientRecord } from "../store/types.js";

export function serializeClient(row: ClientRecord) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    company: row.company,
    whatsapp: row.whatsapp,
    email: row.email,
    ownerUserId: row.ownerUserId,
    notes: row.notes,
    status: row.status,
    lastContactAt: row.lastContactAt?.toISOString() ?? null,
    nextFollowUpAt: row.nextFollowUpAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
