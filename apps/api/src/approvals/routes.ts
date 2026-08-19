import { Hono } from "hono";
import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import {
  applyApprovalDecision,
  buildApprovalSnapshot,
  type ApprovalAction,
} from "../domain/approval-status.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeApproval } from "./dto.js";
import {
  approvalKindSchema,
  approvalStatusSchema,
  createApprovalSchema,
  decideApprovalSchema,
} from "./schema.js";

export function approvalRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/approvals", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const statusQuery = c.req.query("status");
    const statusParsed = statusQuery ? approvalStatusSchema.safeParse(statusQuery) : null;
    if (statusParsed && !statusParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const kindQuery = c.req.query("kind");
    const kindParsed = kindQuery ? approvalKindSchema.safeParse(kindQuery) : null;
    if (kindParsed && !kindParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const rows = await deps.store.listApprovals(workspaceId, {
      status: statusParsed?.success ? statusParsed.data : undefined,
      kind: kindParsed?.success ? kindParsed.data : undefined,
      projectId: c.req.query("projectId") || undefined,
      clientId: c.req.query("clientId") || undefined,
      approverId: c.req.query("approverId") || undefined,
    });
    return c.json(rows.map(serializeApproval));
  });

  routes.get("/projects/:id/approvals", async (c) => {
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
    const rows = await deps.store.listProjectApprovals(project.id);
    return c.json(rows.map(serializeApproval));
  });

  routes.post("/approvals", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createApprovalSchema.safeParse(body);
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
    let currentStageKey: string | null = null;
    if (project.currentStageId) {
      const stage = await deps.store.getStage(project.currentStageId);
      currentStageKey = stage?.key ?? null;
    }
    const created = await deps.store.createApproval({
      workspaceId,
      projectId: project.id,
      kind: parsed.data.kind,
      validationId: parsed.data.validationId ?? null,
      comment: parsed.data.comment ?? null,
      projectSnapshot: buildApprovalSnapshot({
        currentStageKey,
        projectStatus: project.status,
        validationId: parsed.data.validationId ?? null,
        projectId: project.id,
        clientId: project.clientId,
      }),
      now: deps.now(),
    });
    if (!created) {
      return emptyNotFound(c);
    }
    return c.json(serializeApproval(created), 201);
  });

  routes.get("/approvals/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const row = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getApproval(id),
      (item) => item.workspaceId,
    );
    if (!row) {
      return emptyNotFound(c);
    }
    return c.json(serializeApproval(row));
  });

  routes.post("/approvals/:id/decide", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getApproval(id),
      (item) => item.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = decideApprovalSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const applied = applyApprovalDecision({
      from: current.status,
      action: parsed.data.action as ApprovalAction,
      now: deps.now(),
      decidedAt: current.decidedAt,
      revokedAt: current.revokedAt,
    });
    if (!applied.ok) {
      return c.json({ error: "Transição inválida", reason: applied.reason }, 409);
    }
    const persisted = await deps.store.persistApprovalDecision({
      id: current.id,
      status: applied.status,
      approverId: applied.status === "revoked" ? current.approverId : gate.session.sub,
      decidedAt: applied.decidedAt,
      revokedAt: applied.revokedAt,
      comment: parsed.data.comment !== undefined ? parsed.data.comment : current.comment,
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
          approvalId: current.id,
          from: applied.event.payload.from,
          to: applied.event.payload.to,
        },
      });
    }
    return c.json(serializeApproval(persisted));
  });

  return routes;
}
