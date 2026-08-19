import {
  OPEN_BLOCKER_COMPLETE_REASON,
  openBlockerBlocksStage,
  type OpenBlockerHint,
} from "./blocker-status.js";
import type { StageSnapshot } from "./stage-instance.js";
import type { ActivityAction, StageAction } from "./types.js";

export type StageActionItem = {
  action: StageAction;
  toKey: string | null;
  enabled: boolean;
  reason: string | null;
};

export type StageTransitionEvent = {
  action: Extract<ActivityAction, "stage.started" | "stage.transitioned" | "stage.completed">;
  payload: { from?: string; to?: string | null; key?: string };
};

export type StageActionResult =
  | {
      ok: true;
      stages: StageSnapshot[];
      currentStageId: string;
      events: StageTransitionEvent[];
    }
  | { ok: false; reason: string };

function cloneStages(stages: readonly StageSnapshot[]): StageSnapshot[] {
  return stages.map((stage) => ({
    ...stage,
    allowedNextKeys: [...stage.allowedNextKeys],
  }));
}

function currentStage(
  stages: readonly StageSnapshot[],
  currentStageId: string | null,
): StageSnapshot | undefined {
  if (!currentStageId) {
    return undefined;
  }
  return stages.find((stage) => stage.id === currentStageId);
}

function completeReason(status: StageSnapshot["status"]): string | null {
  if (status === "blocked") {
    return "Etapa bloqueada não pode ser concluída";
  }
  if (status === "completed") {
    return "Etapa já concluída";
  }
  if (status === "skipped") {
    return "Etapa pulada não pode ser concluída";
  }
  if (status === "pending") {
    return "Etapa ainda não iniciada";
  }
  return null;
}

export function evaluateStageAction(input: {
  stages: readonly StageSnapshot[];
  currentStageId: string | null;
  stageId: string;
  action: StageAction;
  toKey?: string | null;
  openBlockers?: readonly OpenBlockerHint[];
}): { ok: true; toKey: string | null } | { ok: false; reason: string } {
  const origin = input.stages.find((stage) => stage.id === input.stageId);
  if (!origin) {
    return { ok: false, reason: "Etapa não encontrada" };
  }
  if (origin.id !== input.currentStageId) {
    return { ok: false, reason: "Só a etapa atual pode transicionar" };
  }

  if (input.action === "complete") {
    if (openBlockerBlocksStage(input.openBlockers ?? [], origin.id)) {
      return { ok: false, reason: OPEN_BLOCKER_COMPLETE_REASON };
    }
    const statusReason = completeReason(origin.status);
    if (statusReason) {
      return { ok: false, reason: statusReason };
    }
    if (origin.status !== "in_progress" && origin.status !== "waiting") {
      return { ok: false, reason: "Status da etapa não permite concluir" };
    }
    const successors = origin.allowedNextKeys;
    if (successors.length === 0) {
      if (input.toKey) {
        return {
          ok: false,
          reason: `Não há aresta de ${origin.key} para ${input.toKey}`,
        };
      }
      return { ok: true, toKey: null };
    }
    const target = input.toKey ?? (successors.length === 1 ? successors[0] : undefined);
    if (!target) {
      return { ok: false, reason: "Destino obrigatório" };
    }
    if (!successors.includes(target)) {
      return {
        ok: false,
        reason: `Não há aresta de ${origin.key} para ${target}`,
      };
    }
    const destination = input.stages.find((stage) => stage.key === target);
    if (!destination) {
      return { ok: false, reason: "Destino não pertence a este projeto" };
    }
    return { ok: true, toKey: target };
  }

  if (input.action === "block") {
    if (origin.status === "blocked") {
      return { ok: false, reason: "Etapa já está bloqueada" };
    }
    if (origin.status === "completed") {
      return { ok: false, reason: "Não é possível reabrir etapa concluída" };
    }
    if (origin.status !== "in_progress" && origin.status !== "waiting") {
      return {
        ok: false,
        reason: "Somente a etapa atual em andamento ou aguardando pode ser bloqueada",
      };
    }
    return { ok: true, toKey: null };
  }

  if (input.action === "unblock") {
    if (origin.status !== "blocked") {
      return { ok: false, reason: "Etapa não está bloqueada" };
    }
    return { ok: true, toKey: null };
  }

  if (origin.status === "completed") {
    return { ok: false, reason: "Não é possível reabrir etapa concluída" };
  }
  if (origin.status !== "in_progress") {
    return { ok: false, reason: "Somente etapa em andamento pode aguardar" };
  }
  return { ok: true, toKey: null };
}

export function canTransition(input: {
  stages: readonly StageSnapshot[];
  currentStageId: string | null;
  stageId: string;
  action: StageAction;
  toKey?: string | null;
  openBlockers?: readonly OpenBlockerHint[];
}): boolean {
  return evaluateStageAction(input).ok;
}

export function applyStageAction(input: {
  stages: readonly StageSnapshot[];
  currentStageId: string | null;
  stageId: string;
  action: StageAction;
  toKey?: string | null;
  openBlockers?: readonly OpenBlockerHint[];
}): StageActionResult {
  const decision = evaluateStageAction(input);
  if (!decision.ok) {
    return { ok: false, reason: decision.reason };
  }
  const stages = cloneStages(input.stages);
  const origin = stages.find((stage) => stage.id === input.stageId);
  if (!origin || !input.currentStageId) {
    return { ok: false, reason: "Etapa não encontrada" };
  }

  if (input.action === "block") {
    origin.status = "blocked";
    return { ok: true, stages, currentStageId: origin.id, events: [] };
  }
  if (input.action === "unblock") {
    origin.status = "in_progress";
    return { ok: true, stages, currentStageId: origin.id, events: [] };
  }
  if (input.action === "wait") {
    origin.status = "waiting";
    return { ok: true, stages, currentStageId: origin.id, events: [] };
  }

  origin.status = "completed";
  const events: StageTransitionEvent[] = [
    { action: "stage.completed", payload: { key: origin.key, from: origin.key, to: decision.toKey } },
  ];
  if (!decision.toKey) {
    return { ok: true, stages, currentStageId: origin.id, events };
  }
  const destination = stages.find((stage) => stage.key === decision.toKey);
  if (!destination) {
    return { ok: false, reason: "Destino não pertence a este projeto" };
  }
  destination.status = "in_progress";
  events.push({
    action: "stage.transitioned",
    payload: { from: origin.key, to: destination.key },
  });
  events.push({
    action: "stage.started",
    payload: { key: destination.key },
  });
  return { ok: true, stages, currentStageId: destination.id, events };
}

export function listStageActions(input: {
  stage: StageSnapshot;
  stages: readonly StageSnapshot[];
  currentStageId: string | null;
  openBlockers?: readonly OpenBlockerHint[];
}): StageActionItem[] {
  const completeTargets =
    input.stage.allowedNextKeys.length > 0 ? [...input.stage.allowedNextKeys] : [null];
  const catalog: Array<{ action: StageAction; toKey: string | null }> = [
    ...completeTargets.map((toKey) => ({ action: "complete" as const, toKey })),
    { action: "block", toKey: null },
    { action: "unblock", toKey: null },
    { action: "wait", toKey: null },
  ];
  return catalog.map((item) => {
    const decision = evaluateStageAction({
      stages: input.stages,
      currentStageId: input.currentStageId,
      stageId: input.stage.id,
      action: item.action,
      toKey: item.toKey,
      openBlockers: input.openBlockers,
    });
    return {
      action: item.action,
      toKey: item.toKey,
      enabled: decision.ok,
      reason: decision.ok ? null : decision.reason,
    };
  });
}

export function assertSingleCurrentStage(
  stages: readonly StageSnapshot[],
  currentStageId: string | null,
): boolean {
  const current = currentStage(stages, currentStageId);
  if (!current) {
    return false;
  }
  const inProgress = stages.filter((stage) => stage.status === "in_progress");
  return inProgress.length === 1 && inProgress[0]?.id === current.id;
}
