import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { workflowTemplateIdOf } from "../test/templates";

type ProjectDetail = {
  id: string;
  clientId: string;
  currentStageId: string | null;
  currentStageKey: string | null;
  openBlockerCount?: number;
  waitingOnClient?: boolean;
  stages: Array<{
    id: string;
    key: string;
    status: string;
    actions: Array<{ action: string; enabled: boolean; reason: string | null }>;
  }>;
};

type BlockerDto = {
  id: string;
  status: string;
  title: string;
  assigneeKind: string;
  assigneeUserId: string | null;
  waitingOnClient: boolean;
  waitingOnClientCopy: string | null;
  blocksStageId: string | null;
  blocksProject: boolean;
  sourceMeetingId: string | null;
  allowedActions: string[];
};

type ActivityDto = { action: string; payload: Record<string, unknown> };

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

async function login(email: string, deps = createTestDeps()) {
  const app = createApp(deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "changeme" }),
  });
  return { app, deps, cookie: cookieFrom(response) };
}

async function createProject(app: ReturnType<typeof createApp>, cookie: string, name: string) {
  const clientRes = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: `Cliente ${name}`, ownerUserId: "seed-user" }),
  });
  const client = (await clientRes.json()) as { id: string };
  const projectRes = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name, clientId: client.id, ownerUserId: "seed-user", workflowTemplateId: await workflowTemplateIdOf(app, cookie) }),
  });
  expect(projectRes.status).toBe(201);
  return (await projectRes.json()) as ProjectDetail;
}

async function createOpen(
  app: ReturnType<typeof createApp>,
  cookie: string,
  body: Record<string, unknown>,
) {
  const created = await app.request("/api/blockers", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ workspaceId: "ws-forjado", ...body }),
  });
  expect(created.status).toBe(201);
  return (await created.json()) as BlockerDto;
}

async function decide(
  app: ReturnType<typeof createApp>,
  cookie: string,
  id: string,
  action: string,
  extra: Record<string, unknown> = {},
) {
  return app.request(`/api/blockers/${id}/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ action, ...extra }),
  });
}

async function getProject(app: ReturnType<typeof createApp>, cookie: string, id: string) {
  const response = await app.request(`/api/projects/${id}`, { headers: { cookie } });
  expect(response.status).toBe(200);
  return (await response.json()) as ProjectDetail;
}

async function completeBriefing(
  app: ReturnType<typeof createApp>,
  cookie: string,
  project: ProjectDetail,
) {
  const briefing = project.stages.find((stage) => stage.key === "briefing");
  expect(briefing).toBeDefined();
  if (!briefing) throw new Error("briefing ausente");
  return app.request(`/api/projects/${project.id}/stages/${briefing.id}/transition`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ action: "complete", to: "proposal" }),
  });
}

describe("blockers", () => {
  it("open na etapa atual bloqueia complete e resolve desbloqueia sem avançar", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Com pendência");
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing?.status).toBe("in_progress");
    if (!briefing) return;

    const open = await createOpen(app, cookie, {
      projectId: project.id,
      title: "API key Stripe produção",
      assigneeKind: "internal",
      assigneeUserId: "seed-user",
      blocksStageId: briefing.id,
    });
    expect(open.status).toBe("open");
    expect(open.blocksStageId).toBe(briefing.id);

    const afterCreate = await getProject(app, cookie, project.id);
    expect(afterCreate.stages.find((stage) => stage.key === "briefing")?.status).toBe("blocked");
    expect(afterCreate.openBlockerCount).toBe(1);
    const completeAction = afterCreate.stages
      .find((stage) => stage.key === "briefing")
      ?.actions.find((action) => action.action === "complete");
    expect(completeAction?.enabled).toBe(false);
    expect(completeAction?.reason).toBe("Há pendência em aberto bloqueando esta etapa");

    const blockedComplete = await completeBriefing(app, cookie, afterCreate);
    expect(blockedComplete.status).toBe(409);
    const body = (await blockedComplete.json()) as { reason: string };
    expect(body.reason).toBe("Há pendência em aberto bloqueando esta etapa");

    const resolved = await decide(app, cookie, open.id, "resolve");
    expect(resolved.status).toBe(200);
    await expect(resolved.json()).resolves.toMatchObject({ status: "resolved", id: open.id });

    const afterResolve = await getProject(app, cookie, project.id);
    expect(afterResolve.currentStageKey).toBe("briefing");
    expect(afterResolve.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");
    expect(afterResolve.openBlockerCount).toBe(0);
    const completeOk = await completeBriefing(app, cookie, afterResolve);
    expect(completeOk.status).toBe(200);

    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "blocker.opened")).toBe(true);
    expect(events.some((event) => event.action === "blocker.resolved")).toBe(true);
  });

  it("assigneeKind client ignora userId e devolve copy Aguardando cliente", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Aguarda cliente");
    const open = await createOpen(app, cookie, {
      projectId: project.id,
      title: "Domínio não apontado",
      assigneeKind: "client",
      assigneeUserId: "forged-user",
      sourceMeetingId: "meet-future",
    });
    expect(open.assigneeKind).toBe("client");
    expect(open.assigneeUserId).toBeNull();
    expect(open.waitingOnClient).toBe(true);
    expect(open.waitingOnClientCopy).toBe("Aguardando cliente");
    expect(open.sourceMeetingId).toBe("meet-future");
  });

  it("não mistura Blocker com ChecklistItem", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Checklist distinto");
    const templates = await app.request("/api/checklist-templates", { headers: { cookie } });
    const list = (await templates.json()) as Array<{ id: string }>;
    const applied = await app.request(`/api/projects/${project.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ templateId: list[0]?.id }),
    });
    expect(applied.status).toBe(201);
    const checklist = (await applied.json()) as { id: string; items: Array<{ id: string; title: string }> };
    await createOpen(app, cookie, {
      projectId: project.id,
      title: "Pendência avulsa",
      assigneeKind: "internal",
      assigneeUserId: "seed-user",
    });
    const checklists = await app.request(`/api/projects/${project.id}/checklists`, { headers: { cookie } });
    const rows = (await checklists.json()) as Array<{ id: string; items: Array<{ title: string }> }>;
    expect(rows[0]?.id).toBe(checklist.id);
    expect(rows[0]?.items.some((item) => item.title === "Pendência avulsa")).toBe(false);
    const blockers = await app.request(`/api/projects/${project.id}/blockers`, { headers: { cookie } });
    await expect(blockers.json()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Pendência avulsa" })]),
    );
  });

  it("rejeita decisão ilegal com 409 e sem event extra", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Ilegal");
    const open = await createOpen(app, cookie, {
      projectId: project.id,
      title: "Já resolvida",
      assigneeKind: "internal",
      assigneeUserId: "seed-user",
    });
    const first = await decide(app, cookie, open.id, "resolve");
    expect(first.status).toBe(200);
    const illegal = await decide(app, cookie, open.id, "resolve");
    expect(illegal.status).toBe(409);
    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.filter((event) => event.action === "blocker.resolved")).toHaveLength(1);
  });

  it("IDOR devolve 404 vazio e collection do workspace B vem vazia", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Privado");
    const open = await createOpen(app, cookie, {
      projectId: project.id,
      title: "Segredo",
      assigneeKind: "internal",
      assigneeUserId: "seed-user",
    });

    const loginB = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);

    const getB = await app.request(`/api/blockers/${open.id}`, { headers: { cookie: cookieB } });
    expect(getB.status).toBe(404);
    expect(await getB.text()).toBe("");

    const decideB = await decide(app, cookieB, open.id, "resolve");
    expect(decideB.status).toBe(404);
    expect(await decideB.text()).toBe("");

    const listB = await app.request("/api/blockers", { headers: { cookie: cookieB } });
    expect(listB.status).toBe(200);
    await expect(listB.json()).resolves.toEqual([]);
  });
});
