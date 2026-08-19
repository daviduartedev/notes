import { Hono } from "hono";
import type { AppDeps } from "../deps.js";
import { buildHojeDashboard } from "../domain/hoje-dashboard.js";
import { requireMember } from "../http/session-guard.js";
import { evaluateWorkspaceReminders } from "../reminders/evaluate.js";
import { workspaceIdFromSession } from "../workspace/scope.js";

export function hojeRoutes(deps: AppDeps) {
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
    await evaluateWorkspaceReminders(deps, workspaceId, gate.session.sub);
    const now = deps.now();
    const [pipeline, validations, approvals, blockers, reminders, meetings] = await Promise.all([
      deps.store.listPipelineCards(workspaceId, {}),
      deps.store.listValidations(workspaceId, {}),
      deps.store.listApprovals(workspaceId, {}),
      deps.store.listBlockers(workspaceId, {}),
      deps.store.listReminders(workspaceId, {}),
      deps.store.listMeetings(workspaceId, {}),
    ]);
    return c.json(
      buildHojeDashboard({
        now,
        pipeline,
        validations,
        approvals,
        blockers,
        reminders,
        meetings,
      }),
    );
  });

  return routes;
}
