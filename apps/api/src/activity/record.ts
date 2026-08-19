import { sanitizeActivityPayload } from "../domain/activity.js";
import type { ActivityAction, EntityType } from "../domain/types.js";
import type { AppDeps } from "../deps.js";

const INTERACTION_ACTIONS = new Set<ActivityAction>([
  "client.created",
  "client.updated",
  "project.created",
  "project.updated",
  "project.status_changed",
  "stage.started",
  "stage.transitioned",
  "stage.completed",
  "reminder.completed",
]);

export async function recordActivity(
  deps: AppDeps,
  input: {
    workspaceId: string;
    actorId: string;
    entityType: EntityType;
    entityId: string;
    action: ActivityAction;
    payload: Record<string, unknown>;
  },
) {
  const event = await deps.store.appendActivity({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    payload: sanitizeActivityPayload(input.payload),
  });
  if (INTERACTION_ACTIONS.has(input.action)) {
    await deps.store.touchLastInteraction({
      entityType: input.entityType,
      entityId: input.entityId,
      now: deps.now(),
    });
  }
  return event;
}

export function serializeActivity(row: {
  id: string;
  workspaceId: string;
  actorId: string;
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  payload: Record<string, unknown>;
  createdAt: Date;
}) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    actorId: row.actorId,
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action,
    payload: row.payload,
    createdAt: row.createdAt.toISOString(),
  };
}
