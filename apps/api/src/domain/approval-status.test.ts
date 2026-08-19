import { describe, expect, it } from "vitest";
import {
  applyApprovalDecision,
  buildApprovalSnapshot,
  canDecideApproval,
  isTerminalApprovalStatus,
  listAllowedApprovalActions,
} from "./approval-status";

const now = new Date("2026-08-19T12:00:00.000Z");

describe("máquina de Approval.status", () => {
  it("permite pending para grant, reject ou cancel", () => {
    expect(canDecideApproval("pending", "grant")).toBe(true);
    expect(canDecideApproval("pending", "reject")).toBe(true);
    expect(canDecideApproval("pending", "cancel")).toBe(true);
    expect(canDecideApproval("pending", "revoke")).toBe(false);
  });

  it("permite granted apenas para revoke", () => {
    expect(canDecideApproval("granted", "revoke")).toBe(true);
    expect(canDecideApproval("granted", "grant")).toBe(false);
    expect(canDecideApproval("granted", "reject")).toBe(false);
  });

  it("trata rejected, cancelled e revoked como terminais", () => {
    expect(isTerminalApprovalStatus("rejected")).toBe(true);
    expect(isTerminalApprovalStatus("cancelled")).toBe(true);
    expect(isTerminalApprovalStatus("revoked")).toBe(true);
    expect(isTerminalApprovalStatus("pending")).toBe(false);
    expect(isTerminalApprovalStatus("granted")).toBe(false);
    expect(listAllowedApprovalActions("revoked")).toEqual([]);
  });

  it("grava decidedAt e event ao grant", () => {
    const applied = applyApprovalDecision({
      from: "pending",
      action: "grant",
      now,
      decidedAt: null,
      revokedAt: null,
    });
    expect(applied).toMatchObject({
      ok: true,
      status: "granted",
      decidedAt: now,
      revokedAt: null,
      event: {
        action: "approval.granted",
        payload: { from: "pending", to: "granted" },
      },
    });
    expect(applied).not.toHaveProperty("stage");
    expect(applied).not.toHaveProperty("stageStatus");
  });

  it("revoke preserva decidedAt e marca revokedAt", () => {
    const grantedAt = new Date("2026-08-18T09:00:00.000Z");
    const applied = applyApprovalDecision({
      from: "granted",
      action: "revoke",
      now,
      decidedAt: grantedAt,
      revokedAt: null,
    });
    expect(applied).toMatchObject({
      ok: true,
      status: "revoked",
      decidedAt: grantedAt,
      revokedAt: now,
      event: {
        action: "approval.revoked",
        payload: { from: "granted", to: "revoked" },
      },
    });
  });

  it("cancelar não emite event", () => {
    const applied = applyApprovalDecision({
      from: "pending",
      action: "cancel",
      now,
      decidedAt: null,
      revokedAt: null,
    });
    expect(applied).toMatchObject({ ok: true, status: "cancelled", event: null, decidedAt: now });
  });

  it("rejeita decisão ilegal", () => {
    expect(
      applyApprovalDecision({
        from: "pending",
        action: "revoke",
        now,
        decidedAt: null,
        revokedAt: null,
      }),
    ).toEqual({ ok: false, reason: "Transição inválida" });
  });

  it("monta snapshot com os campos do brief", () => {
    expect(
      buildApprovalSnapshot({
        currentStageKey: "briefing",
        projectStatus: "active",
        validationId: null,
        projectId: "p1",
        clientId: "c1",
      }),
    ).toEqual({
      currentStageKey: "briefing",
      projectStatus: "active",
      validationId: null,
      projectId: "p1",
      clientId: "c1",
    });
  });
});
