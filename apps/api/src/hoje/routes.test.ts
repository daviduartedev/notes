import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { PROPOSAL_WAITING_CLIENT_POLICY } from "../domain/follow-up-policy";
import type { HojeDashboard } from "../domain/hoje-dashboard";
import { workflowTemplateIdOf } from "../test/templates";

type ProjectDetail = {
  id: string;
  clientId: string;
  currentStageId: string | null;
  currentStageKey: string | null;
  stages: Array<{
    id: string;
    key: string;
    isCurrent?: boolean;
    status: string;
    actions: Array<{ action: string; enabled: boolean; toKey: string | null }>;
  }>;
};

type HojeCard = HojeDashboard["needs_attention"][number];

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

function clockDeps(initial: Date) {
  let now = new Date(initial);
  const deps = createTestDeps({ now: () => new Date(now) });
  return {
    deps,
    setNow(next: Date) {
      now = new Date(next);
    },
  };
}

async function login(email: string, clock: ReturnType<typeof clockDeps>) {
  const app = createApp(clock.deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "changeme" }),
  });
  return { app, cookie: cookieFrom(response), clock };
}

async function createProject(
  app: ReturnType<typeof createApp>,
  cookie: string,
  name: string,
  extra: Record<string, unknown> = {},
) {
  const clientRes = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: `Cliente ${name}`, ownerUserId: "seed-user" }),
  });
  const client = (await clientRes.json()) as { id: string };
  const projectRes = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name, clientId: client.id, ownerUserId: "seed-user", workflowTemplateId: await workflowTemplateIdOf(app, cookie), ...extra }),
  });
  expect(projectRes.status).toBe(201);
  return (await projectRes.json()) as ProjectDetail;
}

async function getProject(app: ReturnType<typeof createApp>, cookie: string, id: string) {
  const response = await app.request(`/api/projects/${id}`, { headers: { cookie } });
  expect(response.status).toBe(200);
  return (await response.json()) as ProjectDetail;
}

async function advanceTo(
  app: ReturnType<typeof createApp>,
  cookie: string,
  projectId: string,
  targetKey: string,
) {
  for (let step = 0; step < 12; step += 1) {
    const project = await getProject(app, cookie, projectId);
    if (project.currentStageKey === targetKey) {
      return project;
    }
    const current = project.stages.find((stage) => stage.isCurrent);
    const complete = current?.actions.find((item) => item.action === "complete" && item.enabled);
    expect(current && complete).toBeTruthy();
    if (!current || !complete) return project;
    const response = await app.request(`/api/projects/${projectId}/stages/${current.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ action: "complete", to: complete.toKey }),
    });
    expect(response.status).toBe(200);
  }
  throw new Error(`não alcançou ${targetKey}`);
}

function idsIn(cards: HojeCard[]): string[] {
  return cards.map((card) => card.id);
}

describe("GET /api/hoje", () => {
  it("coloca overdue, validação requested, blocker do cliente e follow-up due nas seções certas", async () => {
    const start = new Date("2026-08-16T12:00:00.000Z");
    const clock = clockDeps(start);
    const { app, cookie } = await login("owner@example.com", clock);

    const overdue = await createProject(app, cookie, "Atrasado", { dueDate: "2026-08-01" });
    const activate = await app.request(`/api/projects/${overdue.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });
    expect(activate.status).toBe(200);

    const withValidation = await createProject(app, cookie, "Com validação");
    const createdValidation = await app.request(`/api/projects/${withValidation.id}/validations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ type: "staging" }),
    });
    expect(createdValidation.status).toBe(201);
    const validation = (await createdValidation.json()) as { id: string };
    const requested = await app.request(`/api/validations/${validation.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ to: "requested" }),
    });
    expect(requested.status).toBe(200);

    const withBlocker = await createProject(app, cookie, "Com cliente");
    const createdBlocker = await app.request("/api/blockers", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        projectId: withBlocker.id,
        title: "Aguardando acesso",
        assigneeKind: "client",
      }),
    });
    expect(createdBlocker.status).toBe(201);
    const blocker = (await createdBlocker.json()) as { id: string };

    const follow = await createProject(app, cookie, "Follow-up");
    await advanceTo(app, cookie, follow.id, "waiting_client");

    clock.setNow(new Date("2026-08-19T12:00:00.000Z"));

    const response = await app.request("/api/hoje?workspaceId=ws-2", { headers: { cookie } });
    expect(response.status).toBe(200);
    const board = (await response.json()) as HojeDashboard;

    expect(idsIn(board.needs_attention)).toContain(`project:${overdue.id}`);
    expect(idsIn(board.waiting_client)).toEqual(
      expect.arrayContaining([`validation:${validation.id}`, `blocker:${blocker.id}`]),
    );
    const followCard = board.today.find((card) => card.kind === "reminder");
    expect(followCard?.href).toMatch(/^\/lembretes\//);
    expect(followCard?.reason.toLowerCase()).toContain("follow-up");
    expect(board.today.some((card) => card.projectName === "Follow-up")).toBe(true);
    expect(board.waiting_client.some((card) => card.kind === "reminder" && card.projectName === "Follow-up")).toBe(
      true,
    );

    for (const card of [
      ...board.needs_attention,
      ...board.today,
      ...board.waiting_client,
      ...board.in_progress,
    ]) {
      expect(card.clientName.length).toBeGreaterThan(0);
      expect(card.projectName.length).toBeGreaterThan(0);
      expect(card.reason.length).toBeGreaterThan(0);
      expect(card.since).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(card.nextAction.length).toBeGreaterThan(0);
      expect(card.href.startsWith("/")).toBe(true);
    }

    const policy = (
      await (
        await app.request("/api/reminders", { headers: { cookie } })
      ).json()
    ) as Array<{ policyKey: string | null }>;
    expect(policy.some((row) => row.policyKey === PROPOSAL_WAITING_CLIENT_POLICY)).toBe(true);
  });

  it("workspace B recebe as quatro seções vazias", async () => {
    const clock = clockDeps(new Date("2026-08-19T12:00:00.000Z"));
    const a = await login("owner@example.com", clock);
    const secret = await createProject(a.app, a.cookie, "Segredo A", { dueDate: "2026-08-01" });
    await a.app.request(`/api/projects/${secret.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: a.cookie },
      body: JSON.stringify({ status: "active" }),
    });

    const b = await login("owner-b@example.com", clock);
    const response = await b.app.request("/api/hoje", { headers: { cookie: b.cookie } });
    expect(response.status).toBe(200);
    const board = (await response.json()) as HojeDashboard;
    expect(board.needs_attention).toEqual([]);
    expect(board.today).toEqual([]);
    expect(board.waiting_client).toEqual([]);
    expect(board.in_progress).toEqual([]);
    const leaked = [...board.needs_attention, ...board.today, ...board.waiting_client, ...board.in_progress].some(
      (card) => card.id.includes(secret.id) || card.href.includes(secret.id),
    );
    expect(leaked).toBe(false);
  });

  it("workspace vazio devolve seções vazias e exige sessão", async () => {
    const clock = clockDeps(new Date("2026-08-19T12:00:00.000Z"));
    const { app, cookie } = await login("owner@example.com", clock);
    const empty = await app.request("/api/hoje", { headers: { cookie } });
    expect(empty.status).toBe(200);
    await expect(empty.json()).resolves.toEqual({
      needs_attention: [],
      today: [],
      waiting_client: [],
      in_progress: [],
    });

    const anon = await app.request("/api/hoje");
    expect(anon.status).toBe(401);
  });
});
