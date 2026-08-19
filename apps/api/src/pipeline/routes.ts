import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { buildPipelineBoard } from "../domain/pipeline-board.js";
import { requireMember } from "../http/session-guard.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { pipelineQuerySchema } from "./schema.js";

export function pipelineRoutes(deps: AppDeps) {
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
    const parsed = pipelineQuerySchema.safeParse({
      ownerUserId: c.req.query("ownerUserId")?.trim() || undefined,
      clientId: c.req.query("clientId")?.trim() || undefined,
      priority: c.req.query("priority")?.trim() || undefined,
    });
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const rows = await deps.store.listPipelineCards(workspaceId, {
      ownerUserId: parsed.data.ownerUserId,
      clientId: parsed.data.clientId,
      priority: parsed.data.priority,
    });
    return c.json(buildPipelineBoard(rows, deps.now()));
  });

  return routes;
}
