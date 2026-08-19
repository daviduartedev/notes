import type { ActivityAction } from "./types.js";

export const VALIDATION_STATUSES = [
  "draft",
  "requested",
  "in_review",
  "changes_requested",
  "approved",
  "rejected",
  "cancelled",
] as const;
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export const VALIDATION_TYPES = [
  "prototype",
  "staging",
  "production",
  "feature",
  "delivery",
] as const;
export type ValidationType = (typeof VALIDATION_TYPES)[number];

export const TERMINAL_VALIDATION_STATUSES = ["approved", "rejected", "cancelled"] as const;

export type ValidationActivityAction = Extract<
  ActivityAction,
  | "validation.requested"
  | "validation.in_review"
  | "validation.changes_requested"
  | "validation.approved"
  | "validation.rejected"
>;

const TRANSITIONS: Record<ValidationStatus, readonly ValidationStatus[]> = {
  draft: ["requested", "cancelled"],
  requested: ["in_review", "cancelled"],
  in_review: ["changes_requested", "approved", "rejected"],
  changes_requested: ["in_review", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

const EVENTS: Partial<Record<ValidationStatus, ValidationActivityAction>> = {
  requested: "validation.requested",
  in_review: "validation.in_review",
  changes_requested: "validation.changes_requested",
  approved: "validation.approved",
  rejected: "validation.rejected",
};

export function isTerminalValidationStatus(status: ValidationStatus): boolean {
  return (TERMINAL_VALIDATION_STATUSES as readonly string[]).includes(status);
}

export function canTransitionValidation(from: ValidationStatus, to: ValidationStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function listAllowedValidationStatuses(from: ValidationStatus): ValidationStatus[] {
  return [...TRANSITIONS[from]];
}

export type ValidationTransitionEvent = {
  action: ValidationActivityAction;
  payload: { from: ValidationStatus; to: ValidationStatus };
};

export type ValidationTransitionResult =
  | {
      ok: true;
      status: ValidationStatus;
      requestedAt: Date | null;
      event: ValidationTransitionEvent | null;
    }
  | { ok: false; reason: string };

export function applyValidationTransition(input: {
  from: ValidationStatus;
  to: ValidationStatus;
  now: Date;
  requestedAt: Date | null;
}): ValidationTransitionResult {
  if (!canTransitionValidation(input.from, input.to)) {
    return { ok: false, reason: "Transição inválida" };
  }
  const requestedAt = input.to === "requested" ? input.now : input.requestedAt;
  const action = EVENTS[input.to];
  return {
    ok: true,
    status: input.to,
    requestedAt,
    event: action ? { action, payload: { from: input.from, to: input.to } } : null,
  };
}
