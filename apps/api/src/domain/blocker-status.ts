import type { ActivityAction, StageStatus } from "./types.js";

export const BLOCKER_STATUSES = ["open", "resolved", "cancelled"] as const;
export type BlockerStatus = (typeof BLOCKER_STATUSES)[number];

export const BLOCKER_ASSIGNEE_KINDS = ["internal", "client"] as const;
export type BlockerAssigneeKind = (typeof BLOCKER_ASSIGNEE_KINDS)[number];

export const BLOCKER_ACTIONS = ["resolve", "cancel"] as const;
export type BlockerAction = (typeof BLOCKER_ACTIONS)[number];

export const TERMINAL_BLOCKER_STATUSES = ["resolved", "cancelled"] as const;

export const OPEN_BLOCKER_COMPLETE_REASON = "Há pendência em aberto bloqueando esta etapa";
export const WAITING_ON_CLIENT_COPY = "Aguardando cliente";

export type BlockerActivityAction = Extract<ActivityAction, "blocker.opened" | "blocker.resolved">;

export type OpenBlockerHint = {
  blocksStageId: string | null;
  blocksProject: boolean;
};

const ACTION_TO_STATUS: Record<BlockerAction, BlockerStatus> = {
  resolve: "resolved",
  cancel: "cancelled",
};

const TRANSITIONS: Record<BlockerStatus, readonly BlockerAction[]> = {
  open: ["resolve", "cancel"],
  resolved: [],
  cancelled: [],
};

export function isTerminalBlockerStatus(status: BlockerStatus): boolean {
  return (TERMINAL_BLOCKER_STATUSES as readonly string[]).includes(status);
}

export function canDecideBlocker(from: BlockerStatus, action: BlockerAction): boolean {
  return TRANSITIONS[from].includes(action);
}

export function listAllowedBlockerActions(from: BlockerStatus): BlockerAction[] {
  return [...TRANSITIONS[from]];
}

export function openBlockerBlocksStage(
  blockers: readonly OpenBlockerHint[],
  stageId: string,
): boolean {
  return blockers.some((blocker) => blocker.blocksProject || blocker.blocksStageId === stageId);
}

export function shouldAutoBlockCurrentStage(
  blocksStageId: string | null,
  currentStageId: string | null,
  currentStatus: StageStatus,
): boolean {
  if (!blocksStageId || !currentStageId || blocksStageId !== currentStageId) {
    return false;
  }
  return currentStatus === "in_progress" || currentStatus === "waiting";
}

export function shouldUnblockAfterClearing(
  remainingOpen: readonly OpenBlockerHint[],
  currentStageId: string,
  currentStatus: StageStatus,
): boolean {
  if (currentStatus !== "blocked") {
    return false;
  }
  return !openBlockerBlocksStage(remainingOpen, currentStageId);
}

export type BlockerDecisionEvent = {
  action: BlockerActivityAction;
  payload: { from: BlockerStatus; to: BlockerStatus };
};

export type BlockerDecisionResult =
  | {
      ok: true;
      status: BlockerStatus;
      resolvedAt: Date | null;
      cancelledAt: Date | null;
      event: BlockerDecisionEvent | null;
    }
  | { ok: false; reason: string };

export function applyBlockerDecision(input: {
  from: BlockerStatus;
  action: BlockerAction;
  now: Date;
  resolvedAt: Date | null;
  cancelledAt: Date | null;
}): BlockerDecisionResult {
  if (!canDecideBlocker(input.from, input.action)) {
    return { ok: false, reason: "Transição inválida" };
  }
  const status = ACTION_TO_STATUS[input.action];
  return {
    ok: true,
    status,
    resolvedAt: input.action === "resolve" ? input.now : input.resolvedAt,
    cancelledAt: input.action === "cancel" ? input.now : input.cancelledAt,
    event:
      input.action === "resolve"
        ? { action: "blocker.resolved", payload: { from: input.from, to: status } }
        : null,
  };
}

export function summarizeOpenBlockers(
  blockers: readonly { assigneeKind: BlockerAssigneeKind }[],
): { openBlockerCount: number; waitingOnClient: boolean } {
  return {
    openBlockerCount: blockers.length,
    waitingOnClient: blockers.some((blocker) => blocker.assigneeKind === "client"),
  };
}

export function blockerVisualState(
  status: BlockerStatus,
  dueDate: Date | null,
  now: Date,
): "overdue" | null {
  if (status !== "open" || dueDate === null) {
    return null;
  }
  return dueDate.getTime() < now.getTime() ? "overdue" : null;
}
