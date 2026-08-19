import { describe, expect, it } from "vitest";
import { applyChecklistItemState } from "./checklist-item";

describe("completar item de checklist", () => {
  it("grava responsável da sessão e completedAt", () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const result = applyChecklistItemState({
      current: { completedAt: null, completedByUserId: null, note: null },
      patch: { completed: true, note: "ok staging" },
      actorUserId: "seed-user",
      now,
    });
    expect(result.next.completedAt).toEqual(now);
    expect(result.next.completedByUserId).toBe("seed-user");
    expect(result.next.note).toBe("ok staging");
    expect(result.completedEvent).toBe(true);
  });

  it("desmarcar limpa responsável e data", () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const result = applyChecklistItemState({
      current: {
        completedAt: now,
        completedByUserId: "seed-user",
        note: "ok",
      },
      patch: { completed: false },
      actorUserId: "other",
      now: new Date("2026-08-19T13:00:00.000Z"),
    });
    expect(result.next.completedAt).toBeNull();
    expect(result.next.completedByUserId).toBeNull();
    expect(result.next.note).toBe("ok");
    expect(result.completedEvent).toBe(false);
  });

  it("não recebe nem devolve Stage.status", () => {
    const keys = Object.keys(
      applyChecklistItemState({
        current: { completedAt: null, completedByUserId: null, note: null },
        patch: { completed: true },
        actorUserId: "seed-user",
        now: new Date(),
      }).next,
    );
    expect(keys).toEqual(["completedAt", "completedByUserId", "note"]);
  });
});
