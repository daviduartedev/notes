import { Hono } from "hono";
import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import { applyValidationTransition } from "../domain/validation-status.js";
import type { ValidationStatus } from "../domain/validation-status.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import type { ValidationUpdateInput } from "../store/types.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeValidation } from "./dto.js";
import {
  createValidationSchema,
  patchValidationSchema,
  toDateOrNull,
  transitionValidationSchema,
  validationStatusSchema,
} from "./schema.js";

export function validationRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/validations", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const statusQuery = c.req.query("status");
    const statusParsed = statusQuery ? validationStatusSchema.safeParse(statusQuery) : null;
    if (statusParsed && !statusParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const dueBefore = toDateOrNull(c.req.query("dueBefore"));
    const dueAfter = toDateOrNull(c.req.query("dueAfter"));
    const rows = await deps.store.listValidations(workspaceId, {
      status: statusParsed?.success ? statusParsed.data : undefined,
      projectId: c.req.query("projectId") || undefined,
      clientId: c.req.query("clientId") || undefined,
      reviewerUserId: c.req.query("reviewerUserId") || undefined,
      dueBefore: dueBefore ?? undefined,
      dueAfter: dueAfter ?? undefined,
    });
    return c.json(rows.map((row) => serializeValidation(row, deps.now())));
  });

  routes.get("/projects/:id/validations", async (c) => {
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
    const rows = await deps.store.listProjectValidations(project.id);
    return c.json(rows.map((row) => serializeValidation(row, deps.now())));
  });

  routes.post("/projects/:id/validations", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const project = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!project) {
      return emptyNotFound(c);
    }
    const parsed = createValidationSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    if (parsed.data.reviewerUserId) {
      const exists = await deps.store.memberExists(workspaceId, parsed.data.reviewerUserId);
      if (!exists) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
    }
    const created = await deps.store.createValidation({
      workspaceId,
      projectId: project.id,
      stageId: parsed.data.stageId ?? null,
      type: parsed.data.type,
      reviewerUserId: parsed.data.reviewerUserId ?? null,
      requesterUserId: gate.session.sub,
      environment: parsed.data.environment ?? null,
      dueDate: toDateOrNull(parsed.data.dueDate) ?? null,
      notes: parsed.data.notes ?? null,
      items: parsed.data.items ?? [],
      checklistId: parsed.data.checklistId ?? null,
      now: deps.now(),
    });
    if (!created) {
      return emptyNotFound(c);
    }
    return c.json(serializeValidation(created, deps.now()), 201);
  });

  routes.get("/validations/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const row = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getValidation(id),
      (item) => item.workspaceId,
    );
    if (!row) {
      return emptyNotFound(c);
    }
    return c.json(serializeValidation(row, deps.now()));
  });

  routes.patch("/validations/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getValidation(id),
      (item) => item.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = patchValidationSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    if (parsed.data.reviewerUserId) {
      const exists = await deps.store.memberExists(current.workspaceId, parsed.data.reviewerUserId);
      if (!exists) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
    }
    const patch: ValidationUpdateInput = {};
    if (parsed.data.type !== undefined) patch.type = parsed.data.type;
    if (parsed.data.stageId !== undefined) patch.stageId = parsed.data.stageId;
    if (parsed.data.reviewerUserId !== undefined) patch.reviewerUserId = parsed.data.reviewerUserId;
    if (parsed.data.environment !== undefined) patch.environment = parsed.data.environment;
    if (parsed.data.dueDate !== undefined) patch.dueDate = toDateOrNull(parsed.data.dueDate) ?? null;
    if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
    if (parsed.data.items !== undefined) patch.items = parsed.data.items;
    if (parsed.data.resultNotes !== undefined) patch.resultNotes = parsed.data.resultNotes;
    if (parsed.data.checklistId !== undefined) patch.checklistId = parsed.data.checklistId;
    const updated = await deps.store.updateValidation(current.id, patch);
    if (!updated) {
      return emptyNotFound(c);
    }
    return c.json(serializeValidation(updated, deps.now()));
  });

  routes.post("/validations/:id/transition", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getValidation(id),
      (item) => item.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = transitionValidationSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const applied = applyValidationTransition({
      from: current.status,
      to: parsed.data.to as ValidationStatus,
      now: deps.now(),
      requestedAt: current.requestedAt,
    });
    if (!applied.ok) {
      return c.json({ error: "Transição inválida", reason: applied.reason }, 409);
    }
    const persisted = await deps.store.persistValidationTransition({
      id: current.id,
      status: applied.status,
      requestedAt: applied.requestedAt,
      resultNotes: parsed.data.resultNotes,
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
          validationId: current.id,
          from: applied.event.payload.from,
          to: applied.event.payload.to,
        },
      });
    }
    return c.json(serializeValidation(persisted, deps.now()));
  });

  return routes;
}
