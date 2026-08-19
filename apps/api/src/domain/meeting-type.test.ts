import { describe, expect, it } from "vitest";
import {
  EXTERNAL_PARTICIPANT_REASON,
  MEETING_TYPES,
  uniqueParticipantIds,
  validateMeetingParticipants,
} from "./meeting-type";

describe("tipos de reunião", () => {
  it("expõe os seis tipos do brief", () => {
    expect([...MEETING_TYPES]).toEqual([
      "kickoff",
      "scope_alignment",
      "prototype_review",
      "staging_validation",
      "production_validation",
      "delivery",
    ]);
  });

  it("aceita membros do workspace e remove duplicata", () => {
    const result = validateMeetingParticipants(
      ["seed-user", " member-user ", "seed-user"],
      new Set(["seed-user", "member-user"]),
    );
    expect(result).toEqual({
      ok: true,
      participantUserIds: ["seed-user", "member-user"],
    });
  });

  it("rejeita participante de fora", () => {
    const result = validateMeetingParticipants(
      ["seed-user", "outsider"],
      new Set(["seed-user"]),
    );
    expect(result).toEqual({ ok: false, reason: EXTERNAL_PARTICIPANT_REASON });
  });

  it("unique ignora vazio", () => {
    expect(uniqueParticipantIds(["", " a ", "a"])).toEqual(["a"]);
  });
});
