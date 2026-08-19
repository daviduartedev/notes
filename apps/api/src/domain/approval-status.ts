import type { ActivityAction, ProjectStatus } from "./types.js";

export const APPROVAL_STATUSES = [
  "pending",
  "granted",
  "rejected",
  "cancelled",
  "revoked",
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const APPROVAL_KINDS = [
  "proposal",
  "scope",
  "prototype",
  "staging",
  "production",
  "final_acceptance",
] as const;
export type ApprovalKind = (typeof APPROVAL_KINDS)[number];

export const APPROVAL_ACTIONS = ["grant", "reject", "cancel", "revoke"] as const;
export type ApprovalAction = (typeof APPROVAL_ACTIONS)[number];

export const TERMINAL_APPROVAL_STATUSES = ["rejected", "cancelled", "revoked"] as const;

export type ApprovalActivityAction = Extract<
  ActivityAction,
  "approval.granted" | "approval.rejected" | "approval.revoked"
>;

export type ApprovalSnapshot = {
  currentStageKey: string | null;
  projectStatus: ProjectStatus;
  validationId: string | null;
  projectId: string;
  clientId: string;
};

const ACTION_TO_STATUS: Record<ApprovalAction, ApprovalStatus> = {
  grant: "granted",
  reject: "rejected",
  cancel: "cancelled",
  revoke: "revoked",
};

const TRANSITIONS: Record<ApprovalStatus, readonly ApprovalAction[]> = {
  pending: ["grant", "reject", "cancel"],
  granted: ["revoke"],
  rejected: [],
  cancelled: [],
  revoked: [],
};

const EVENTS: Partial<Record<ApprovalStatus, ApprovalActivityAction>> = {
  granted: "approval.granted",
  rejected: "approval.rejected",
  revoked: "approval.revoked",
};

export function isTerminalApprovalStatus(status: ApprovalStatus): boolean {
  return (TERMINAL_APPROVAL_STATUSES as readonly string[]).includes(status);
}

export function canDecideApproval(from: ApprovalStatus, action: ApprovalAction): boolean {
  return TRANSITIONS[from].includes(action);
}

export function listAllowedApprovalActions(from: ApprovalStatus): ApprovalAction[] {
  return [...TRANSITIONS[from]];
}

export function buildApprovalSnapshot(input: {
  currentStageKey: string | null;
  projectStatus: ProjectStatus;
  validationId: string | null;
  projectId: string;
  clientId: string;
}): ApprovalSnapshot {
  return {
    currentStageKey: input.currentStageKey,
    projectStatus: input.projectStatus,
    validationId: input.validationId,
    projectId: input.projectId,
    clientId: input.clientId,
  };
}

export type ApprovalDecisionEvent = {
  action: ApprovalActivityAction;
  payload: { from: ApprovalStatus; to: ApprovalStatus };
};

export type ApprovalDecisionResult =
  | {
      ok: true;
      status: ApprovalStatus;
      decidedAt: Date | null;
      revokedAt: Date | null;
      event: ApprovalDecisionEvent | null;
    }
  | { ok: false; reason: string };

export function applyApprovalDecision(input: {
  from: ApprovalStatus;
  action: ApprovalAction;
  now: Date;
  decidedAt: Date | null;
  revokedAt: Date | null;
}): ApprovalDecisionResult {
  if (!canDecideApproval(input.from, input.action)) {
    return { ok: false, reason: "Transição inválida" };
  }
  const status = ACTION_TO_STATUS[input.action];
  const decidedAt =
    input.action === "grant" || input.action === "reject" || input.action === "cancel"
      ? input.now
      : input.decidedAt;
  const revokedAt = input.action === "revoke" ? input.now : input.revokedAt;
  const eventAction = EVENTS[status];
  return {
    ok: true,
    status,
    decidedAt,
    revokedAt,
    event: eventAction ? { action: eventAction, payload: { from: input.from, to: status } } : null,
  };
}
