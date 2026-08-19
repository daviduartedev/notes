export const CLIENT_STATUSES = ["lead", "active", "inactive", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const PROJECT_STATUSES = [
  "draft",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const STAGE_PHASES = ["commercial", "design", "development"] as const;
export type StagePhase = (typeof STAGE_PHASES)[number];

export const STAGE_STATUSES = [
  "pending",
  "in_progress",
  "waiting",
  "blocked",
  "completed",
  "skipped",
] as const;
export type StageStatus = (typeof STAGE_STATUSES)[number];

export const STAGE_ACTIONS = ["complete", "block", "unblock", "wait"] as const;
export type StageAction = (typeof STAGE_ACTIONS)[number];

export const ACTIVITY_ACTIONS = [
  "client.created",
  "client.updated",
  "project.created",
  "project.updated",
  "project.status_changed",
  "stage.started",
  "stage.transitioned",
  "stage.completed",
  "checklist.applied",
  "checklist.item_completed",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ENTITY_TYPES = ["client", "project"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];
