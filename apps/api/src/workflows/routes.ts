import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeWorkflowTemplate } from "./dto.js";
import {
  createWorkflowTemplateSchema,
  normalizeStageInputs,
  patchWorkflowTemplateSchema,
} from "./schema.js";

export function workflowRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/workflow-templates", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const rows = await deps.store.listWorkflowTemplates(workspaceId);
    return c.json(rows.map(serializeWorkflowTemplate));
  });

  routes.post("/workflow-templates", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    if (gate.session.role !== "owner") {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createWorkflowTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const stages = normalizeStageInputs(parsed.data.stages);
    if (!stages) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const created = await deps.store.createWorkflowTemplate({
      workspaceId,
      key: parsed.data.key,
      name: parsed.data.name,
      isDefault: parsed.data.isDefault ?? false,
      stages,
    });
    if (!created) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    return c.json(serializeWorkflowTemplate(created), 201);
  });

  routes.get("/workflow-templates/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    void workspaceIdFromSession(gate.session, { query: c.req.query() });
    const template = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getWorkflowTemplate(id),
      (row) => row.workspaceId,
    );
    if (!template) {
      return emptyNotFound(c);
    }
    return c.json(serializeWorkflowTemplate(template));
  });

  routes.patch("/workflow-templates/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const template = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getWorkflowTemplate(id),
      (row) => row.workspaceId,
    );
    if (!template) {
      return emptyNotFound(c);
    }
    if (gate.session.role !== "owner") {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = patchWorkflowTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const stages = parsed.data.stages ? normalizeStageInputs(parsed.data.stages) : undefined;
    if (parsed.data.stages && !stages) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const updated = await deps.store.updateWorkflowTemplate(template.id, {
      name: parsed.data.name,
      isDefault: parsed.data.isDefault,
      stages: stages ?? undefined,
    });
    if (!updated) {
      return emptyNotFound(c);
    }
    return c.json(serializeWorkflowTemplate(updated));
  });

  routes.delete("/workflow-templates/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    void workspaceIdFromSession(gate.session, { query: c.req.query() });
    const template = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getWorkflowTemplate(id),
      (row) => row.workspaceId,
    );
    if (!template) {
      return emptyNotFound(c);
    }
    if (gate.session.role !== "owner") {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const result = await deps.store.deleteWorkflowTemplate(template.id);
    if (result === "not_found") {
      return emptyNotFound(c);
    }
    if (result === "catalog" || result === "in_use") {
      return c.json({ error: "Não é possível excluir" }, 409);
    }
    return c.body(null, 204);
  });

  return routes;
}
