export const MEETING_TYPES = [
  "kickoff",
  "scope_alignment",
  "prototype_review",
  "staging_validation",
  "production_validation",
  "delivery",
] as const;

export type MeetingType = (typeof MEETING_TYPES)[number];

export const EXTERNAL_PARTICIPANT_REASON = "Participante fora do workspace";

export function uniqueParticipantIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function validateMeetingParticipants(
  participantUserIds: string[],
  workspaceMemberIds: ReadonlySet<string>,
): { ok: true; participantUserIds: string[] } | { ok: false; reason: string } {
  const unique = uniqueParticipantIds(participantUserIds);
  for (const id of unique) {
    if (!workspaceMemberIds.has(id)) {
      return { ok: false, reason: EXTERNAL_PARTICIPANT_REASON };
    }
  }
  return { ok: true, participantUserIds: unique };
}
