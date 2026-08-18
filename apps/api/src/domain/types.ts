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

export const ACTIVITY_ACTIONS = [
  "client.created",
  "client.updated",
  "project.created",
  "project.updated",
  "project.status_changed",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ENTITY_TYPES = ["client", "project"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];
