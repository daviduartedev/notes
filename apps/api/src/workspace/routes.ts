import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { readSession } from "../auth/read-session.js";
import { hasMembership, workspaceIdFromSession } from "./scope.js";

export function workspaceRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/me", async (c) => {
    const session = await readSession(c, deps.authSecret);
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

  routes.get("/workspace", async (c) => {
    const session = await readSession(c, deps.authSecret);
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
    const workspace = await deps.getWorkspace(workspaceId);
    if (!workspace) {
      return c.body(null, 404);
    }
    return c.json(workspace);
  });

  return routes;
}
