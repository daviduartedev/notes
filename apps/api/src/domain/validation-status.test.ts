import { describe, expect, it } from "vitest";
import {
  applyValidationTransition,
  canTransitionValidation,
  isTerminalValidationStatus,
  listAllowedValidationStatuses,
} from "./validation-status";

const now = new Date("2026-08-19T12:00:00.000Z");

describe("máquina de Validation.status", () => {
  it("permite draft para requested ou cancelled", () => {
    expect(canTransitionValidation("draft", "requested")).toBe(true);
    expect(canTransitionValidation("draft", "cancelled")).toBe(true);
    expect(canTransitionValidation("draft", "approved")).toBe(false);
    expect(canTransitionValidation("draft", "in_review")).toBe(false);
  });

  it("permite requested para in_review ou cancelled", () => {
    expect(canTransitionValidation("requested", "in_review")).toBe(true);
    expect(canTransitionValidation("requested", "cancelled")).toBe(true);
    expect(canTransitionValidation("requested", "approved")).toBe(false);
  });

  it("permite in_review para changes_requested, approved ou rejected", () => {
    expect(canTransitionValidation("in_review", "changes_requested")).toBe(true);
    expect(canTransitionValidation("in_review", "approved")).toBe(true);
    expect(canTransitionValidation("in_review", "rejected")).toBe(true);
    expect(canTransitionValidation("in_review", "cancelled")).toBe(false);
    expect(canTransitionValidation("in_review", "draft")).toBe(false);
  });

  it("permite changes_requested para in_review ou cancelled", () => {
    expect(canTransitionValidation("changes_requested", "in_review")).toBe(true);
    expect(canTransitionValidation("changes_requested", "cancelled")).toBe(true);
    expect(canTransitionValidation("changes_requested", "approved")).toBe(false);
  });

  it("trata approved, rejected e cancelled como terminais", () => {
    expect(isTerminalValidationStatus("approved")).toBe(true);
    expect(isTerminalValidationStatus("rejected")).toBe(true);
    expect(isTerminalValidationStatus("cancelled")).toBe(true);
    expect(isTerminalValidationStatus("in_review")).toBe(false);
    expect(listAllowedValidationStatuses("approved")).toEqual([]);
    expect(canTransitionValidation("approved", "in_review")).toBe(false);
  });

  it("grava requestedAt e event ao solicitar", () => {
    const applied = applyValidationTransition({
      from: "draft",
      to: "requested",
      now,
      requestedAt: null,
    });
    expect(applied).toMatchObject({
      ok: true,
      status: "requested",
      requestedAt: now,
      event: {
        action: "validation.requested",
        payload: { from: "draft", to: "requested" },
      },
    });
  });

  it("emite validation.changes_requested sem Approval nem Stage", () => {
    const applied = applyValidationTransition({
      from: "in_review",
      to: "changes_requested",
      now,
      requestedAt: now,
    });
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.event?.action).toBe("validation.changes_requested");
    expect(applied).not.toHaveProperty("approval");
    expect(applied).not.toHaveProperty("stage");
    expect(applied).not.toHaveProperty("stageStatus");
  });

  it("cancelar não emite event", () => {
    const applied = applyValidationTransition({
      from: "draft",
      to: "cancelled",
      now,
      requestedAt: null,
    });
    expect(applied).toMatchObject({ ok: true, status: "cancelled", event: null });
  });

  it("rejeita transição ilegal", () => {
    expect(
      applyValidationTransition({
        from: "draft",
        to: "approved",
        now,
        requestedAt: null,
      }),
    ).toEqual({ ok: false, reason: "Transição inválida" });
  });
});
