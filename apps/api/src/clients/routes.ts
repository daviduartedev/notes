import { recordActivity, serializeActivity } from "../activity/record.js";
import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { canTransitionClientStatus } from "../domain/client-status.js";
import type { ClientStatus } from "../domain/types.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import type { ClientUpdateInput } from "../store/types.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeClient } from "./dto.js";
import {
  clientStatusSchema,
  createClientSchema,
  patchClientSchema,
  toDateOrNull,
} from "./schema.js";

export function clientRoutes(deps: AppDeps) {
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
    const name = c.req.query("name")?.trim() || undefined;
    const ownerUserId = c.req.query("ownerUserId")?.trim() || undefined;
    const statusQuery = c.req.query("status");
    const statusParsed = statusQuery ? clientStatusSchema.safeParse(statusQuery) : null;
    if (statusParsed && !statusParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const rows = await deps.store.listClients(workspaceId, {
      name,
      ownerUserId,
      status: statusParsed?.data,
    });
    return c.json(rows.map(serializeClient));
  });

  routes.post("/", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const ownerOk = await deps.store.memberExists(workspaceId, parsed.data.ownerUserId);
    if (!ownerOk) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const created = await deps.store.createClient({
      workspaceId,
      name: parsed.data.name,
      company: parsed.data.company ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      email: parsed.data.email ?? null,
      ownerUserId: parsed.data.ownerUserId,
      notes: parsed.data.notes ?? null,
      status: "lead",
      lastContactAt: toDateOrNull(parsed.data.lastContactAt) ?? null,
      nextFollowUpAt: toDateOrNull(parsed.data.nextFollowUpAt) ?? null,
      lastInteractionAt: null,
    });
    await recordActivity(deps, {
      workspaceId,
      actorId: gate.session.sub,
      entityType: "client",
      entityId: created.id,
      action: "client.created",
      payload: { name: created.name, status: created.status },
    });
    return c.json(serializeClient(created), 201);
  });

  routes.get("/:id/activity", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const record = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    if (!record) {
      return emptyNotFound(c);
    }
    const events = await deps.store.listClientHistory(record.workspaceId, record.id);
    return c.json(events.map(serializeActivity));
  });

  routes.get("/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const record = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    if (!record) {
      return emptyNotFound(c);
    }
    return c.json(serializeClient(record));
  });

  routes.patch("/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = patchClientSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    if (parsed.data.status && !canTransitionClientStatus(current.status, parsed.data.status)) {
      return c.json({ error: "Transição inválida" }, 409);
    }
    if (parsed.data.ownerUserId) {
      const ownerOk = await deps.store.memberExists(current.workspaceId, parsed.data.ownerUserId);
      if (!ownerOk) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
    }
    const patch: ClientUpdateInput = {};
    if (parsed.data.name !== undefined) patch.name = parsed.data.name;
    if (parsed.data.company !== undefined) patch.company = parsed.data.company;
    if (parsed.data.whatsapp !== undefined) patch.whatsapp = parsed.data.whatsapp;
    if (parsed.data.email !== undefined) patch.email = parsed.data.email;
    if (parsed.data.ownerUserId !== undefined) patch.ownerUserId = parsed.data.ownerUserId;
    if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
    if (parsed.data.status !== undefined) patch.status = parsed.data.status as ClientStatus;
    if (parsed.data.lastContactAt !== undefined) {
      patch.lastContactAt = toDateOrNull(parsed.data.lastContactAt) ?? null;
    }
    if (parsed.data.nextFollowUpAt !== undefined) {
      patch.nextFollowUpAt = toDateOrNull(parsed.data.nextFollowUpAt) ?? null;
    }
    const updated = await deps.store.updateClient(current.id, patch);
    if (!updated) {
      return emptyNotFound(c);
    }
    const fields = Object.keys(patch);
    if (fields.length > 0) {
      const payload: Record<string, unknown> = { fields };
      if (parsed.data.status && parsed.data.status !== current.status) {
        payload.from = current.status;
        payload.to = parsed.data.status;
      }
      await recordActivity(deps, {
        workspaceId: current.workspaceId,
        actorId: gate.session.sub,
        entityType: "client",
        entityId: current.id,
        action: "client.updated",
        payload,
      });
    }
    return c.json(serializeClient(updated));
  });

  routes.delete("/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const projectCount = await deps.store.countProjectsForClient(current.id);
    if (projectCount > 0) {
      return c.json({ error: "Cliente possui projetos" }, 409);
    }
    await deps.store.deleteClient(current.id);
    return c.body(null, 204);
  });

  return routes;
}
