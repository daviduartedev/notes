import { describe, expect, it } from "vitest";
import { SAAS_DELIVERY_STAGES } from "./saas-delivery-template";
import { instantiateProjectStages, type StageSnapshot } from "./stage-instance";
import {
  applyStageAction,
  assertSingleCurrentStage,
  canTransition,
  evaluateStageAction,
  listStageActions,
} from "./stage-transition";

function projectAt(key: string): { stages: StageSnapshot[]; currentStageId: string } {
  const { stages } = instantiateProjectStages(SAAS_DELIVERY_STAGES);
  const target = stages.find((stage) => stage.key === key);
  if (!target) {
    throw new Error(`etapa ${key} ausente`);
  }
  for (const stage of stages) {
    if (stage.order < target.order) {
      stage.status = "completed";
    } else if (stage.id === target.id) {
      stage.status = "in_progress";
    } else {
      stage.status = "pending";
    }
  }
  return { stages, currentStageId: target.id };
}

describe("matriz de transições de etapa", () => {
  it("permite cada aresta linear do grafo SaaS", () => {
    for (let index = 0; index < SAAS_DELIVERY_STAGES.length - 1; index += 1) {
      const from = SAAS_DELIVERY_STAGES[index];
      const to = SAAS_DELIVERY_STAGES[index + 1];
      if (!from || !to) continue;
      const state = projectAt(from.key);
      const origin = state.stages.find((stage) => stage.key === from.key);
      expect(origin).toBeDefined();
      if (!origin) continue;
      expect(
        canTransition({
          stages: state.stages,
          currentStageId: state.currentStageId,
          stageId: origin.id,
          action: "complete",
          toKey: to.key,
        }),
      ).toBe(true);
      const applied = applyStageAction({
        stages: state.stages,
        currentStageId: state.currentStageId,
        stageId: origin.id,
        action: "complete",
        toKey: to.key,
      });
      expect(applied.ok).toBe(true);
      if (!applied.ok) continue;
      const next = applied.stages.find((stage) => stage.id === applied.currentStageId);
      expect(next?.key).toBe(to.key);
      expect(next?.status).toBe("in_progress");
      expect(applied.stages.find((stage) => stage.key === from.key)?.status).toBe("completed");
      expect(applied.events.map((event) => event.action)).toEqual([
        "stage.completed",
        "stage.transitioned",
        "stage.started",
      ]);
      expect(applied.events.find((event) => event.action === "stage.transitioned")?.payload).toEqual({
        from: from.key,
        to: to.key,
      });
      expect(assertSingleCurrentStage(applied.stages, applied.currentStageId)).toBe(true);
    }
  });

  it("rejeita pulo ilegal briefing → kickoff e ux → development", () => {
    const briefing = projectAt("briefing");
    const origin = briefing.stages.find((stage) => stage.key === "briefing");
    expect(origin).toBeDefined();
    if (!origin) return;
    const jump = evaluateStageAction({
      stages: briefing.stages,
      currentStageId: briefing.currentStageId,
      stageId: origin.id,
      action: "complete",
      toKey: "kickoff",
    });
    expect(jump).toEqual({ ok: false, reason: "Não há aresta de briefing para kickoff" });

    const ux = projectAt("ux");
    const uxStage = ux.stages.find((stage) => stage.key === "ux");
    expect(uxStage).toBeDefined();
    if (!uxStage) return;
    const skipDev = evaluateStageAction({
      stages: ux.stages,
      currentStageId: ux.currentStageId,
      stageId: uxStage.id,
      action: "complete",
      toKey: "development",
    });
    expect(skipDev.ok).toBe(false);
    if (skipDev.ok) return;
    expect(skipDev.reason).toBe("Não há aresta de ux para development");
  });

  it("não completa etapa blocked", () => {
    const state = projectAt("ux");
    const origin = state.stages.find((stage) => stage.key === "ux");
    expect(origin).toBeDefined();
    if (!origin) return;
    origin.status = "blocked";
    const result = applyStageAction({
      stages: state.stages,
      currentStageId: state.currentStageId,
      stageId: origin.id,
      action: "complete",
      toKey: "prototype",
    });
    expect(result).toEqual({ ok: false, reason: "Etapa bloqueada não pode ser concluída" });
  });

  it("trata completed como terminal e não reabre", () => {
    const state = projectAt("production");
    const production = state.stages.find((stage) => stage.key === "production");
    expect(production).toBeDefined();
    if (!production) return;
    const done = applyStageAction({
      stages: state.stages,
      currentStageId: state.currentStageId,
      stageId: production.id,
      action: "complete",
    });
    expect(done.ok).toBe(true);
    if (!done.ok) return;
    expect(done.currentStageId).toBe(production.id);
    expect(done.stages.find((stage) => stage.key === "production")?.status).toBe("completed");
    const reopen = applyStageAction({
      stages: done.stages,
      currentStageId: done.currentStageId,
      stageId: production.id,
      action: "complete",
    });
    expect(reopen).toEqual({ ok: false, reason: "Etapa já concluída" });
    const blockDone = evaluateStageAction({
      stages: done.stages,
      currentStageId: done.currentStageId,
      stageId: production.id,
      action: "block",
    });
    expect(blockDone).toEqual({ ok: false, reason: "Não é possível reabrir etapa concluída" });
  });

  it("expõe motivo pt-BR para botão disabled fora da etapa atual", () => {
    const state = projectAt("briefing");
    const prototype = state.stages.find((stage) => stage.key === "prototype");
    expect(prototype).toBeDefined();
    if (!prototype) return;
    const actions = listStageActions({
      stage: prototype,
      stages: state.stages,
      currentStageId: state.currentStageId,
    });
    expect(actions.every((item) => item.enabled === false)).toBe(true);
    expect(actions[0]?.reason).toBe("Só a etapa atual pode transicionar");
  });

  it("bloqueia e desbloqueia a etapa atual", () => {
    const state = projectAt("development");
    const origin = state.stages.find((stage) => stage.key === "development");
    expect(origin).toBeDefined();
    if (!origin) return;
    const blocked = applyStageAction({
      stages: state.stages,
      currentStageId: state.currentStageId,
      stageId: origin.id,
      action: "block",
    });
    expect(blocked.ok).toBe(true);
    if (!blocked.ok) return;
    expect(blocked.stages.find((stage) => stage.id === origin.id)?.status).toBe("blocked");
    expect(blocked.events).toEqual([]);
    const unblocked = applyStageAction({
      stages: blocked.stages,
      currentStageId: blocked.currentStageId,
      stageId: origin.id,
      action: "unblock",
    });
    expect(unblocked.ok).toBe(true);
    if (!unblocked.ok) return;
    expect(unblocked.stages.find((stage) => stage.id === origin.id)?.status).toBe("in_progress");
  });

  it("rejeita complete com Blocker open mesmo se a etapa estiver in_progress", () => {
    const state = projectAt("briefing");
    const origin = state.stages.find((stage) => stage.key === "briefing");
    expect(origin).toBeDefined();
    if (!origin) return;
    const blocked = evaluateStageAction({
      stages: state.stages,
      currentStageId: state.currentStageId,
      stageId: origin.id,
      action: "complete",
      toKey: "proposal",
      openBlockers: [{ blocksStageId: origin.id, blocksProject: false }],
    });
    expect(blocked).toEqual({
      ok: false,
      reason: "Há pendência em aberto bloqueando esta etapa",
    });
    const projectBlock = evaluateStageAction({
      stages: state.stages,
      currentStageId: state.currentStageId,
      stageId: origin.id,
      action: "complete",
      toKey: "proposal",
      openBlockers: [{ blocksStageId: null, blocksProject: true }],
    });
    expect(projectBlock.ok).toBe(false);
    const cleared = evaluateStageAction({
      stages: state.stages,
      currentStageId: state.currentStageId,
      stageId: origin.id,
      action: "complete",
      toKey: "proposal",
      openBlockers: [],
    });
    expect(cleared.ok).toBe(true);
  });
});
