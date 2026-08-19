import { describe, expect, it } from "vitest";
import {
  applyReminderDecision,
  canDecideReminder,
  DEFAULT_SNOOZE_MS,
  listAllowedReminderActions,
  promoteScheduledIfDue,
} from "./reminder-status.js";

const now = new Date("2026-08-19T12:00:00.000Z");
const dueAt = new Date("2026-08-19T10:00:00.000Z");

describe("máquina de reminder", () => {
  it("due aceita complete, snooze e cancel", () => {
    expect(listAllowedReminderActions("due")).toEqual(["complete", "snooze", "cancel"]);
    expect(canDecideReminder("scheduled", "complete")).toBe(false);
    expect(canDecideReminder("scheduled", "cancel")).toBe(true);
  });

  it("complete grava done e event", () => {
    const applied = applyReminderDecision({
      from: "due",
      action: "complete",
      now,
      dueAt,
      doneAt: null,
      cancelledAt: null,
    });
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.status).toBe("done");
    expect(applied.doneAt).toEqual(now);
    expect(applied.event).toBe("reminder.completed");
  });

  it("snooze volta para scheduled com +7 dias", () => {
    const applied = applyReminderDecision({
      from: "due",
      action: "snooze",
      now,
      dueAt,
      doneAt: null,
      cancelledAt: null,
    });
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.status).toBe("scheduled");
    expect(applied.dueAt.getTime()).toBe(now.getTime() + DEFAULT_SNOOZE_MS);
    expect(applied.event).toBeNull();
  });

  it("decisão ilegal devolve reason", () => {
    const applied = applyReminderDecision({
      from: "done",
      action: "complete",
      now,
      dueAt,
      doneAt: now,
      cancelledAt: null,
    });
    expect(applied).toEqual({ ok: false, reason: "Transição inválida" });
  });

  it("promove scheduled para due quando dueAt passou", () => {
    expect(promoteScheduledIfDue("scheduled", dueAt, now)).toBe("due");
    expect(promoteScheduledIfDue("scheduled", new Date("2026-08-20T00:00:00.000Z"), now)).toBe(
      "scheduled",
    );
  });
});
