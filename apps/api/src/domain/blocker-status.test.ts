import { describe, expect, it } from "vitest";
import {
  applyBlockerDecision,
  canDecideBlocker,
  isTerminalBlockerStatus,
  listAllowedBlockerActions,
  OPEN_BLOCKER_COMPLETE_REASON,
  openBlockerBlocksStage,
  shouldAutoBlockCurrentStage,
  shouldUnblockAfterClearing,
  WAITING_ON_CLIENT_COPY,
} from "./blocker-status";

const now = new Date("2026-08-19T12:00:00.000Z");

describe("máquina de Blocker.status", () => {
  it("permite open para resolve ou cancel", () => {
    expect(canDecideBlocker("open", "resolve")).toBe(true);
    expect(canDecideBlocker("open", "cancel")).toBe(true);
    expect(canDecideBlocker("resolved", "resolve")).toBe(false);
    expect(canDecideBlocker("cancelled", "cancel")).toBe(false);
  });

  it("trata resolved e cancelled como terminais", () => {
    expect(isTerminalBlockerStatus("resolved")).toBe(true);
    expect(isTerminalBlockerStatus("cancelled")).toBe(true);
    expect(isTerminalBlockerStatus("open")).toBe(false);
    expect(listAllowedBlockerActions("resolved")).toEqual([]);
  });

  it("grava resolvedAt e event ao resolver", () => {
    const applied = applyBlockerDecision({
      from: "open",
      action: "resolve",
      now,
      resolvedAt: null,
      cancelledAt: null,
    });
    expect(applied).toMatchObject({
      ok: true,
      status: "resolved",
      resolvedAt: now,
      cancelledAt: null,
      event: {
        action: "blocker.resolved",
        payload: { from: "open", to: "resolved" },
      },
    });
    expect(applied).not.toHaveProperty("stage");
    expect(applied).not.toHaveProperty("toKey");
  });

  it("cancelar não emite event", () => {
    const applied = applyBlockerDecision({
      from: "open",
      action: "cancel",
      now,
      resolvedAt: null,
      cancelledAt: null,
    });
    expect(applied).toMatchObject({
      ok: true,
      status: "cancelled",
      cancelledAt: now,
      event: null,
    });
  });

  it("rejeita decisão ilegal", () => {
    expect(
      applyBlockerDecision({
        from: "resolved",
        action: "resolve",
        now,
        resolvedAt: now,
        cancelledAt: null,
      }),
    ).toEqual({ ok: false, reason: "Transição inválida" });
  });
});

describe("invariante Blocker × etapa", () => {
  it("bloqueia complete quando o blocker aponta para a etapa ou o projeto", () => {
    expect(
      openBlockerBlocksStage(
        [{ blocksStageId: "st-1", blocksProject: false }],
        "st-1",
      ),
    ).toBe(true);
    expect(
      openBlockerBlocksStage([{ blocksStageId: null, blocksProject: true }], "st-1"),
    ).toBe(true);
    expect(
      openBlockerBlocksStage(
        [{ blocksStageId: "st-other", blocksProject: false }],
        "st-1",
      ),
    ).toBe(false);
    expect(OPEN_BLOCKER_COMPLETE_REASON).toBe("Há pendência em aberto bloqueando esta etapa");
  });

  it("auto-bloqueia só a etapa atual in_progress ou waiting", () => {
    expect(shouldAutoBlockCurrentStage("st-1", "st-1", "in_progress")).toBe(true);
    expect(shouldAutoBlockCurrentStage("st-1", "st-1", "waiting")).toBe(true);
    expect(shouldAutoBlockCurrentStage("st-1", "st-1", "blocked")).toBe(false);
    expect(shouldAutoBlockCurrentStage("st-2", "st-1", "in_progress")).toBe(false);
    expect(shouldAutoBlockCurrentStage(null, "st-1", "in_progress")).toBe(false);
  });

  it("desbloqueia a etapa só se não restar blocker open a bloquear", () => {
    expect(shouldUnblockAfterClearing([], "st-1", "blocked")).toBe(true);
    expect(
      shouldUnblockAfterClearing(
        [{ blocksStageId: "st-1", blocksProject: false }],
        "st-1",
        "blocked",
      ),
    ).toBe(false);
    expect(shouldUnblockAfterClearing([], "st-1", "in_progress")).toBe(false);
  });

  it("exporta copy Aguardando cliente", () => {
    expect(WAITING_ON_CLIENT_COPY).toBe("Aguardando cliente");
  });
});
