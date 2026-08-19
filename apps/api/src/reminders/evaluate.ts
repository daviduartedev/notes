import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import { evaluateFollowUpPolicies } from "../domain/follow-up-policy.js";

export async function evaluateWorkspaceReminders(
  deps: AppDeps,
  workspaceId: string,
  actorId: string,
) {
  const now = deps.now();
  await deps.store.promoteDueReminders(workspaceId, now);
  const existing = await deps.store.listReminders(workspaceId, {});
  const projects = await deps.store.listFollowUpCandidates(workspaceId);
  const plan = evaluateFollowUpPolicies({ now, projects, existing });
  for (const id of plan.promoteIds) {
    const current = existing.find((row) => row.id === id);
    if (!current) continue;
    await deps.store.persistReminderDecision({
      id,
      status: "due",
      dueAt: current.dueAt,
      doneAt: current.doneAt,
      cancelledAt: current.cancelledAt,
      snoozedUntil: current.snoozedUntil,
    });
  }
  for (const item of plan.create) {
    const created = await deps.store.createReminder({
      workspaceId: item.workspaceId,
      subjectType: item.subjectType,
      subjectId: item.subjectId,
      clientId: item.clientId,
      projectId: item.projectId,
      channel: item.channel,
      policyKey: item.policyKey,
      status: item.status,
      dueAt: item.dueAt,
      draftMessage: item.draftMessage,
      now,
    });
    if (!created?.projectId) continue;
    await recordActivity(deps, {
      workspaceId,
      actorId,
      entityType: "project",
      entityId: created.projectId,
      action: "reminder.created",
      payload: {
        reminderId: created.id,
        policyKey: created.policyKey,
        channel: created.channel,
      },
    });
  }
}
