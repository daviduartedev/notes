import type { MemberRecord, MeetingRecord } from "../store/types.js";

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeMeeting(row: MeetingRecord, members: MemberRecord[]) {
  const names = new Map(members.map((member) => [member.userId, member.name]));
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    title: row.title,
    type: row.type,
    startsAt: row.startsAt.toISOString(),
    participantUserIds: row.participantUserIds,
    participants: row.participantUserIds.map((userId) => ({
      userId,
      name: names.get(userId) ?? null,
    })),
    notes: row.notes,
    decisions: row.decisions,
    nextSteps: row.nextSteps,
    clientId: row.clientId,
    clientName: row.clientName,
    projectId: row.projectId,
    projectName: row.projectName,
    stageId: row.stageId,
    validationId: row.validationId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export { iso };
