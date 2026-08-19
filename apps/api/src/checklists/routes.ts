import { Hono } from "hono";
import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import { applyChecklistItemState } from "../domain/checklist-item.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import {
  serializeChecklistItemLookup,
  serializeChecklistTemplate,
  serializeProjectChecklist,
} from "./dto.js";
import {
  applyChecklistSchema,
  patchChecklistItemSchema,
  patchChecklistTemplateSchema,
} from "./schema.js";

export function checklistRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/checklist-templates", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const rows = await deps.store.listChecklistTemplates(workspaceId);
    return c.json(rows.map(serializeChecklistTemplate));
  });

  routes.patch("/checklist-templates/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const template = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getChecklistTemplate(id),
      (row) => row.workspaceId,
    );
    if (!template) {
      return emptyNotFound(c);
    }
    if (gate.session.role !== "owner") {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = patchChecklistTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    if (parsed.data.items) {
      const known = new Set(template.items.map((item) => item.id));
      if (parsed.data.items.some((item) => !known.has(item.id))) {
        return emptyNotFound(c);
      }
    }
    const updated = await deps.store.updateChecklistTemplate(template.id, {
      name: parsed.data.name,
      description: parsed.data.description,
      items: parsed.data.items,
    });
    if (!updated) {
      return emptyNotFound(c);
    }
    return c.json(serializeChecklistTemplate(updated));
  });

  routes.get("/checklists", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const rows = await deps.store.listWorkspaceChecklists(workspaceId);
    return c.json(rows.map(serializeProjectChecklist));
  });

  routes.get("/projects/:id/checklists", async (c) => {
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
    const rows = await deps.store.listProjectChecklists(project.id);
    return c.json(rows.map(serializeProjectChecklist));
  });

  routes.post("/projects/:id/checklists/apply", async (c) => {
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
    const parsed = applyChecklistSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    await deps.store.listChecklistTemplates(workspaceId);
    const template = await lookupForSession(
      gate.session,
      parsed.data.templateId,
      (id) => deps.store.getChecklistTemplate(id),
      (row) => row.workspaceId,
    );
    if (!template) {
      return emptyNotFound(c);
    }
    const applied = await deps.store.applyChecklist({
      workspaceId,
      projectId: project.id,
      templateId: template.id,
      stageId: parsed.data.stageId ?? null,
      now: deps.now(),
    });
    if (!applied) {
      return emptyNotFound(c);
    }
    await recordActivity(deps, {
      workspaceId,
      actorId: gate.session.sub,
      entityType: "project",
      entityId: project.id,
      action: "checklist.applied",
      payload: {
        checklistId: applied.id,
        templateId: applied.templateId,
        name: applied.name,
        stageId: applied.stageId,
      },
    });
    return c.json(serializeProjectChecklist(applied), 201);
  });

  routes.patch("/checklist-items/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const item = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getChecklistItem(id),
      (row) => row.workspaceId,
    );
    if (!item) {
      return emptyNotFound(c);
    }
    const parsed = patchChecklistItemSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const applied = applyChecklistItemState({
      current: {
        completedAt: item.completedAt,
        completedByUserId: item.completedByUserId,
        note: item.note,
      },
      patch: { completed: parsed.data.completed, note: parsed.data.note },
      actorUserId: gate.session.sub,
      now: deps.now(),
    });
    const updated = await deps.store.updateChecklistItem(item.id, applied.next);
    if (!updated) {
      return emptyNotFound(c);
    }
    if (applied.completedEvent) {
      await recordActivity(deps, {
        workspaceId: item.workspaceId,
        actorId: gate.session.sub,
        entityType: "project",
        entityId: item.projectId,
        action: "checklist.item_completed",
        payload: {
          checklistId: item.checklistId,
          itemId: item.id,
          title: item.title,
        },
      });
    }
    return c.json(serializeChecklistItemLookup(updated));
  });

  return routes;
}
