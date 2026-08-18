import { recordActivity, serializeActivity } from "../activity/record.js";
import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { canTransitionProjectStatus } from "../domain/project-status.js";
import type { ProjectPriority, ProjectStatus } from "../domain/types.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import type { ProjectUpdateInput } from "../store/types.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeProject } from "./dto.js";
import {
  createProjectSchema,
  patchProjectSchema,
  projectPrioritySchema,
  projectStatusSchema,
  toDateOrNull,
} from "./schema.js";

async function clientNameOf(
  deps: AppDeps,
  clientId: string,
): Promise<string> {
  const client = await deps.store.getClient(clientId);
  return client?.name ?? "";
}

async function toDto(deps: AppDeps, row: Parameters<typeof serializeProject>[0]) {
  return serializeProject(row, await clientNameOf(deps, row.clientId), deps.now());
}

export function projectRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, {
      query: c.req.query(),
    });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const statusQuery = c.req.query("status");
    const statusParsed = statusQuery ? projectStatusSchema.safeParse(statusQuery) : null;
    if (statusParsed && !statusParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const priorityQuery = c.req.query("priority");
    const priorityParsed = priorityQuery ? projectPrioritySchema.safeParse(priorityQuery) : null;
    if (priorityParsed && !priorityParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const dueBeforeRaw = c.req.query("dueBefore");
    const dueAfterRaw = c.req.query("dueAfter");
    if (dueBeforeRaw && Number.isNaN(Date.parse(dueBeforeRaw))) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    if (dueAfterRaw && Number.isNaN(Date.parse(dueAfterRaw))) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const rows = await deps.store.listProjects(workspaceId, {
      ownerUserId: c.req.query("ownerUserId")?.trim() || undefined,
      status: statusParsed?.data,
      clientId: c.req.query("clientId")?.trim() || undefined,
      priority: priorityParsed?.data,
      dueBefore: dueBeforeRaw ? new Date(dueBeforeRaw) : undefined,
      dueAfter: dueAfterRaw ? new Date(dueAfterRaw) : undefined,
    });
    return c.json(await Promise.all(rows.map((row) => toDto(deps, row))));
  });

  routes.post("/", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const client = await lookupForSession(
      gate.session,
      parsed.data.clientId,
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    if (!client) {
      return emptyNotFound(c);
    }
    const ownerOk = await deps.store.memberExists(workspaceId, parsed.data.ownerUserId);
    if (!ownerOk) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const created = await deps.store.createProject({
      workspaceId,
      clientId: client.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      ownerUserId: parsed.data.ownerUserId,
      status: "draft",
      startDate: toDateOrNull(parsed.data.startDate) ?? null,
      dueDate: toDateOrNull(parsed.data.dueDate) ?? null,
      priority: parsed.data.priority ?? "medium",
      progress: parsed.data.progress ?? 0,
      notes: parsed.data.notes ?? null,
    });
    await recordActivity(deps, {
      workspaceId,
      actorId: gate.session.sub,
      entityType: "project",
      entityId: created.id,
      action: "project.created",
      payload: { name: created.name, clientId: created.clientId, status: created.status },
    });
    return c.json(await toDto(deps, created), 201);
  });

  routes.get("/:id/activity", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const record = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!record) {
      return emptyNotFound(c);
    }
    const events = await deps.store.listActivity(record.workspaceId, "project", record.id);
    return c.json(events.map(serializeActivity));
  });

  routes.get("/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const record = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!record) {
      return emptyNotFound(c);
    }
    return c.json(await toDto(deps, record));
  });

  routes.patch("/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = patchProjectSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    if (parsed.data.status && !canTransitionProjectStatus(current.status, parsed.data.status)) {
      return c.json({ error: "Transição inválida" }, 409);
    }
    if (parsed.data.ownerUserId) {
      const ownerOk = await deps.store.memberExists(current.workspaceId, parsed.data.ownerUserId);
      if (!ownerOk) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
    }
    if (parsed.data.clientId && parsed.data.clientId !== current.clientId) {
      const client = await lookupForSession(
        gate.session,
        parsed.data.clientId,
        (id) => deps.store.getClient(id),
        (row) => row.workspaceId,
      );
      if (!client) {
        return emptyNotFound(c);
      }
    }
    const patch: ProjectUpdateInput = {};
    if (parsed.data.name !== undefined) patch.name = parsed.data.name;
    if (parsed.data.description !== undefined) patch.description = parsed.data.description;
    if (parsed.data.clientId !== undefined) patch.clientId = parsed.data.clientId;
    if (parsed.data.ownerUserId !== undefined) patch.ownerUserId = parsed.data.ownerUserId;
    if (parsed.data.status !== undefined) patch.status = parsed.data.status as ProjectStatus;
    if (parsed.data.priority !== undefined) patch.priority = parsed.data.priority as ProjectPriority;
    if (parsed.data.progress !== undefined) patch.progress = parsed.data.progress;
    if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
    if (parsed.data.startDate !== undefined) {
      patch.startDate = toDateOrNull(parsed.data.startDate) ?? null;
    }
    if (parsed.data.dueDate !== undefined) {
      patch.dueDate = toDateOrNull(parsed.data.dueDate) ?? null;
    }
    const updated = await deps.store.updateProject(current.id, patch);
    if (!updated) {
      return emptyNotFound(c);
    }
    const statusChanged =
      parsed.data.status !== undefined && parsed.data.status !== current.status;
    const otherFields = Object.keys(patch).filter((key) => key !== "status");
    if (otherFields.length > 0) {
      await recordActivity(deps, {
        workspaceId: current.workspaceId,
        actorId: gate.session.sub,
        entityType: "project",
        entityId: current.id,
        action: "project.updated",
        payload: { fields: otherFields },
      });
    }
    if (statusChanged && parsed.data.status) {
      await recordActivity(deps, {
        workspaceId: current.workspaceId,
        actorId: gate.session.sub,
        entityType: "project",
        entityId: current.id,
        action: "project.status_changed",
        payload: { from: current.status, to: parsed.data.status },
      });
    }
    return c.json(await toDto(deps, updated));
  });

  routes.delete("/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    await deps.store.deleteProject(current.id);
    return c.body(null, 204);
  });

  return routes;
}
