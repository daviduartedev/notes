import { Hono } from "hono";
import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import { MANUAL_REMINDER_POLICY } from "../domain/attention-lead.js";
import {
  applyReminderDecision,
  type ReminderAction,
} from "../domain/reminder-status.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeReminder } from "./dto.js";
import { evaluateWorkspaceReminders } from "./evaluate.js";
import { createReminderSchema, decideReminderSchema, reminderStatusSchema } from "./schema.js";

export function reminderRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/reminders", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const statusQuery = c.req.query("status");
    const statusParsed = statusQuery ? reminderStatusSchema.safeParse(statusQuery) : null;
    if (statusParsed && !statusParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    await evaluateWorkspaceReminders(deps, workspaceId, gate.session.sub);
    const rows = await deps.store.listReminders(workspaceId, {
      status: statusParsed?.success ? statusParsed.data : undefined,
      projectId: c.req.query("projectId") || undefined,
      clientId: c.req.query("clientId") || undefined,
    });
    return c.json(rows.map((row) => serializeReminder(row, deps.now())));
  });

  routes.post("/reminders", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createReminderSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const client = await lookupForSession(
      gate.session,
      parsed.data.clientId,
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    const project = await lookupForSession(
      gate.session,
      parsed.data.projectId,
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!client || !project) {
      return c.json({ error: "Dados inválidos", reason: "Cliente ou projeto inválido" }, 400);
    }
    if (project.clientId !== client.id) {
      return c.json({ error: "Dados inválidos", reason: "Projeto não pertence ao cliente" }, 400);
    }
    const now = deps.now();
    const dueAt = parsed.data.dueAt;
    const created = await deps.store.createReminder({
      workspaceId,
      subjectType: "project",
      subjectId: project.id,
      clientId: client.id,
      projectId: project.id,
      channel: "internal",
      policyKey: MANUAL_REMINDER_POLICY,
      status: dueAt.getTime() <= now.getTime() ? "due" : "scheduled",
      dueAt,
      draftMessage: parsed.data.draftMessage,
      now,
    });
    if (!created) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    await recordActivity(deps, {
      workspaceId,
      actorId: gate.session.sub,
      entityType: "project",
      entityId: project.id,
      action: "reminder.created",
      payload: {
        reminderId: created.id,
        policyKey: created.policyKey,
        channel: created.channel,
      },
    });
    return c.json(serializeReminder(created, now), 201);
  });

  routes.get("/projects/:id/reminders", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const project = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!project) {
      return emptyNotFound(c);
    }
    await evaluateWorkspaceReminders(deps, project.workspaceId, gate.session.sub);
    const rows = await deps.store.listProjectReminders(project.id);
    return c.json(rows.map((row) => serializeReminder(row, deps.now())));
  });

  routes.get("/reminders/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const row = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getReminder(id),
      (item) => item.workspaceId,
    );
    if (!row) {
      return emptyNotFound(c);
    }
    return c.json(serializeReminder(row, deps.now()));
  });

  routes.post("/reminders/:id/decide", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getReminder(id),
      (item) => item.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = decideReminderSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const applied = applyReminderDecision({
      from: current.status,
      action: parsed.data.action as ReminderAction,
      now: deps.now(),
      dueAt: current.dueAt,
      doneAt: current.doneAt,
      cancelledAt: current.cancelledAt,
      snoozeUntil: parsed.data.snoozeUntil ?? null,
    });
    if (!applied.ok) {
      return c.json({ error: "Transição inválida", reason: applied.reason }, 409);
    }
    const persisted = await deps.store.persistReminderDecision({
      id: current.id,
      status: applied.status,
      dueAt: applied.dueAt,
      doneAt: applied.doneAt,
      cancelledAt: applied.cancelledAt,
      snoozedUntil: applied.snoozedUntil,
    });
    if (!persisted) {
      return emptyNotFound(c);
    }
    if (applied.event && persisted.projectId) {
      await recordActivity(deps, {
        workspaceId: current.workspaceId,
        actorId: gate.session.sub,
        entityType: "project",
        entityId: persisted.projectId,
        action: applied.event,
        payload: {
          reminderId: current.id,
          from: current.status,
          to: applied.status,
        },
      });
    }
    return c.json(serializeReminder(persisted, deps.now()));
  });

  return routes;
}
