import { Hono } from "hono";
import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import {
  applyBlockerDecision,
  shouldAutoBlockCurrentStage,
  shouldUnblockAfterClearing,
  type BlockerAction,
  type OpenBlockerHint,
} from "../domain/blocker-status.js";
import { applyStageAction } from "../domain/stage-transition.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import { toStageSnapshot } from "../projects/dto.js";
import type { StageRecord } from "../store/types.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeBlocker } from "./dto.js";
import {
  blockerAssigneeKindSchema,
  blockerStatusSchema,
  createBlockerSchema,
  decideBlockerSchema,
} from "./schema.js";

function hintsOf(rows: Array<{ status: string; blocksStageId: string | null; blocksProject: boolean }>): OpenBlockerHint[] {
  return rows
    .filter((row) => row.status === "open")
    .map((row) => ({ blocksStageId: row.blocksStageId, blocksProject: row.blocksProject }));
}

function patchesFromStatuses(before: StageRecord[], after: ReturnType<typeof toStageSnapshot>[], now: Date) {
  return after
    .filter((stage) => {
      const previous = before.find((item) => item.id === stage.id);
      return previous && previous.status !== stage.status;
    })
    .map((stage) => {
      const previous = before.find((item) => item.id === stage.id);
      return {
        id: stage.id,
        status: stage.status,
        startedAt: stage.status === "in_progress" && !previous?.startedAt ? now : undefined,
        completedAt: stage.status === "completed" ? now : undefined,
      };
    });
}

async function maybePersistStage(
  deps: AppDeps,
  projectId: string,
  currentStageId: string | null,
  action: "block" | "unblock",
  now: Date,
) {
  if (!currentStageId) return;
  const stages = await deps.store.listStagesByProject(projectId);
  const applied = applyStageAction({
    stages: stages.map(toStageSnapshot),
    currentStageId,
    stageId: currentStageId,
    action,
  });
  if (!applied.ok) return;
  await deps.store.persistStageAction({
    projectId,
    currentStageId: applied.currentStageId,
    patches: patchesFromStatuses(stages, applied.stages, now),
  });
}

export function blockerRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/blockers", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const statusQuery = c.req.query("status");
    const statusParsed = statusQuery ? blockerStatusSchema.safeParse(statusQuery) : null;
    if (statusParsed && !statusParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const kindQuery = c.req.query("assigneeKind");
    const kindParsed = kindQuery ? blockerAssigneeKindSchema.safeParse(kindQuery) : null;
    if (kindParsed && !kindParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const blockingQuery = c.req.query("blocking");
    const overdueQuery = c.req.query("overdue");
    const rows = await deps.store.listBlockers(workspaceId, {
      status: statusParsed?.success ? statusParsed.data : undefined,
      assigneeKind: kindParsed?.success ? kindParsed.data : undefined,
      assigneeUserId: c.req.query("assigneeUserId") || undefined,
      projectId: c.req.query("projectId") || undefined,
      clientId: c.req.query("clientId") || undefined,
      blocking: blockingQuery === "true" || blockingQuery === "1" ? true : undefined,
      overdue: overdueQuery === "true" || overdueQuery === "1" ? true : undefined,
      now: deps.now(),
    });
    return c.json(rows.map((row) => serializeBlocker(row, deps.now())));
  });

  routes.get("/projects/:id/blockers", async (c) => {
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
    const rows = await deps.store.listProjectBlockers(project.id);
    return c.json(rows.map((row) => serializeBlocker(row, deps.now())));
  });

  routes.post("/blockers", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createBlockerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const project = await lookupForSession(
      gate.session,
      parsed.data.projectId,
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!project) {
      return emptyNotFound(c);
    }
    const assigneeKind = parsed.data.assigneeKind;
    let assigneeUserId: string | null = null;
    if (assigneeKind === "internal") {
      const requested = parsed.data.assigneeUserId ?? null;
      if (!requested) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
      const exists = await deps.store.memberExists(workspaceId, requested);
      if (!exists) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
      assigneeUserId = requested;
    }
    const created = await deps.store.createBlocker({
      workspaceId,
      projectId: project.id,
      title: parsed.data.title,
      assigneeKind,
      assigneeUserId,
      blocksStageId: parsed.data.blocksStageId ?? null,
      blocksProject: parsed.data.blocksProject ?? false,
      dueDate: parsed.data.dueDate ?? null,
      notes: parsed.data.notes ?? null,
      sourceMeetingId: parsed.data.sourceMeetingId ?? null,
      now: deps.now(),
    });
    if (!created) {
      return emptyNotFound(c);
    }
    const current = project.currentStageId
      ? await deps.store.getStage(project.currentStageId)
      : null;
    if (
      current &&
      shouldAutoBlockCurrentStage(created.blocksStageId, project.currentStageId, current.status)
    ) {
      await maybePersistStage(deps, project.id, project.currentStageId, "block", deps.now());
    }
    await recordActivity(deps, {
      workspaceId: project.workspaceId,
      actorId: gate.session.sub,
      entityType: "project",
      entityId: project.id,
      action: "blocker.opened",
      payload: { blockerId: created.id, title: created.title },
    });
    return c.json(serializeBlocker(created, deps.now()), 201);
  });

  routes.get("/blockers/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const row = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getBlocker(id),
      (item) => item.workspaceId,
    );
    if (!row) {
      return emptyNotFound(c);
    }
    return c.json(serializeBlocker(row, deps.now()));
  });

  routes.post("/blockers/:id/decide", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getBlocker(id),
      (item) => item.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = decideBlockerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const applied = applyBlockerDecision({
      from: current.status,
      action: parsed.data.action as BlockerAction,
      now: deps.now(),
      resolvedAt: current.resolvedAt,
      cancelledAt: current.cancelledAt,
    });
    if (!applied.ok) {
      return c.json({ error: "Transição inválida", reason: applied.reason }, 409);
    }
    const persisted = await deps.store.persistBlockerDecision({
      id: current.id,
      status: applied.status,
      resolvedAt: applied.resolvedAt,
      cancelledAt: applied.cancelledAt,
      notes: parsed.data.notes !== undefined ? parsed.data.notes : current.notes,
    });
    if (!persisted) {
      return emptyNotFound(c);
    }
    if (applied.event) {
      await recordActivity(deps, {
        workspaceId: current.workspaceId,
        actorId: gate.session.sub,
        entityType: "project",
        entityId: current.projectId,
        action: applied.event.action,
        payload: {
          blockerId: current.id,
          from: applied.event.payload.from,
          to: applied.event.payload.to,
        },
      });
    }
    const remaining = await deps.store.listProjectBlockers(current.projectId);
    const project = await deps.store.getProject(current.projectId);
    const currentStage = project?.currentStageId
      ? await deps.store.getStage(project.currentStageId)
      : null;
    if (
      project?.currentStageId &&
      currentStage &&
      shouldUnblockAfterClearing(hintsOf(remaining), project.currentStageId, currentStage.status)
    ) {
      await maybePersistStage(deps, project.id, project.currentStageId, "unblock", deps.now());
    }
    return c.json(serializeBlocker(persisted, deps.now()));
  });

  return routes;
}
