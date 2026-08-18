import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { readLiveSession } from "../auth/read-session.js";
import { lookupForSession } from "./lookup.js";
import { hasMembership, workspaceIdFromSession } from "./scope.js";

export function workspaceRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/me", async (c) => {
    const session = await readLiveSession(c, deps);
    if (!session) {
      return c.json({ error: "Não autenticado" }, 401);
    }
    if (!hasMembership(session)) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    return c.json({
      id: session.sub,
      email: session.email,
      role: session.role,
      workspaceId: session.workspaceId,
    });
  });

  routes.get("/workspace/members", async (c) => {
    const session = await readLiveSession(c, deps);
    if (!session) {
      return c.json({ error: "Não autenticado" }, 401);
    }
    if (!hasMembership(session)) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const workspaceId = workspaceIdFromSession(session, {
      query: c.req.query(),
    });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const members = await deps.store.listMembers(workspaceId);
    return c.json(
      members.map((member) => ({
        id: member.userId,
        name: member.name,
        email: member.email,
      })),
    );
  });

  routes.get("/workspace/:id", async (c) => {
    const session = await readLiveSession(c, deps);
    if (!session) {
      return c.json({ error: "Não autenticado" }, 401);
    }
    if (!hasMembership(session)) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const workspace = await lookupForSession(
      session,
      c.req.param("id"),
      deps.getWorkspace,
      (record) => record.id,
    );
    if (!workspace) {
      return c.body(null, 404);
    }
    return c.json(workspace);
  });

  routes.get("/workspace", async (c) => {
    const session = await readLiveSession(c, deps);
    if (!session) {
      return c.json({ error: "Não autenticado" }, 401);
    }
    if (!hasMembership(session)) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const workspaceId = workspaceIdFromSession(session, {
      query: c.req.query(),
    });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const workspace = await lookupForSession(
      session,
      workspaceId,
      deps.getWorkspace,
      (record) => record.id,
    );
    if (!workspace) {
      return c.body(null, 404);
    }
    return c.json(workspace);
  });

  return routes;
}
