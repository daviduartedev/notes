import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import type { PipelineBoardDto, PipelineCardDto } from "../domain/pipeline-board";
import { workflowTemplateIdOf } from "../test/templates";

type StageActionDto = {
  action: string;
  toKey: string | null;
  enabled: boolean;
};

type StageDto = {
  id: string;
  key: string;
  isCurrent: boolean;
  actions: StageActionDto[];
};

type ProjectDetail = {
  id: string;
  currentStageKey: string | null;
  stages: StageDto[];
};

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

async function login(email = "owner@example.com", deps = createTestDeps()) {
  const app = createApp(deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "changeme" }),
  });
  return { app, deps, cookie: cookieFrom(response), status: response.status };
}

async function createClient(app: ReturnType<typeof createApp>, cookie: string) {
  const response = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: "Cliente Board", ownerUserId: "seed-user" }),
  });
  return (await response.json()) as { id: string };
}

async function createProject(
  app: ReturnType<typeof createApp>,
  cookie: string,
  clientId: string,
  body: Record<string, unknown> = {},
) {
  const response = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      name: "Projeto",
      clientId,
      ownerUserId: "seed-user",
      workflowTemplateId: await workflowTemplateIdOf(app, cookie),
      ...body,
    }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as ProjectDetail & { name: string; ownerUserId: string };
}

async function getProject(app: ReturnType<typeof createApp>, cookie: string, id: string) {
  const response = await app.request(`/api/projects/${id}`, { headers: { cookie } });
  expect(response.status).toBe(200);
  return (await response.json()) as ProjectDetail;
}

async function transition(
  app: ReturnType<typeof createApp>,
  cookie: string,
  projectId: string,
  stageId: string,
  body: Record<string, unknown>,
) {
  return app.request(`/api/projects/${projectId}/stages/${stageId}/transition`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });
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
    const response = await transition(app, cookie, projectId, current.id, {
      action: "complete",
      to: complete.toKey,
    });
    expect(response.status).toBe(200);
  }
  throw new Error(`não alcançou ${targetKey}`);
}

function idsIn(board: PipelineBoardDto, key: string): string[] {
  return (board.columns.find((column) => column.key === key)?.projects ?? []).map((project) => project.id);
}

function allIds(board: PipelineBoardDto): string[] {
  return board.columns.flatMap((column) => column.projects.map((project) => project.id));
}

describe("GET /api/pipeline", () => {
  it("agrupa dois projetos só na coluna da etapa atual", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const briefing = await createProject(app, cookie, client.id, { name: "No briefing" });
    const later = await createProject(app, cookie, client.id, { name: "No UX" });
    await advanceTo(app, cookie, later.id, "ux");

    const response = await app.request("/api/pipeline", { headers: { cookie } });
    expect(response.status).toBe(200);
    const board = (await response.json()) as PipelineBoardDto;
    expect(board.columns).toHaveLength(10);
    expect(idsIn(board, "briefing")).toEqual([briefing.id]);
    expect(idsIn(board, "ux")).toEqual([later.id]);
    expect(board.columns.filter((column) => idsIn(board, column.key).includes(briefing.id))).toHaveLength(1);
    expect(board.columns.filter((column) => idsIn(board, column.key).includes(later.id))).toHaveLength(1);
  });

  it("filtra por responsável e ignora workspaceId na query", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const mine = await createProject(app, cookie, client.id, { name: "Meu", ownerUserId: "seed-user" });
    await createProject(app, cookie, client.id, { name: "Dele", ownerUserId: "member-user" });

    const response = await app.request("/api/pipeline?ownerUserId=seed-user&workspaceId=ws-2", {
      headers: { cookie },
    });
    expect(response.status).toBe(200);
    const board = (await response.json()) as PipelineBoardDto;
    expect(allIds(board)).toEqual([mine.id]);
  });

  it("omite completed/cancelled e projeto sem etapa atual", async () => {
    const { app, deps, cookie } = await login();
    const client = await createClient(app, cookie);
    const done = await createProject(app, cookie, client.id, { name: "Fechado" });
    const orphan = await createProject(app, cookie, client.id, { name: "Órfão" });
    const visible = await createProject(app, cookie, client.id, { name: "Visível" });

    const activate = await app.request(`/api/projects/${done.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });
    expect(activate.status).toBe(200);
    const complete = await app.request(`/api/projects/${done.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "completed" }),
    });
    expect(complete.status).toBe(200);

    await deps.store.updateProject(orphan.id, { currentStageId: null });

    const response = await app.request("/api/pipeline", { headers: { cookie } });
    const board = (await response.json()) as PipelineBoardDto;
    expect(allIds(board)).toEqual([visible.id]);
  });

  it("inclui projeto on_hold no quadro", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const created = await createProject(app, cookie, client.id, { name: "Pausado" });
    const activate = await app.request(`/api/projects/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });
    expect(activate.status).toBe(200);
    const hold = await app.request(`/api/projects/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "on_hold" }),
    });
    expect(hold.status).toBe(200);
    const response = await app.request("/api/pipeline", { headers: { cookie } });
    const board = (await response.json()) as PipelineBoardDto;
    expect(allIds(board)).toEqual([created.id]);
  });

  it("membro do workspace B não vê cards do A", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const secret = await createProject(app, cookie, client.id, { name: "Segredo A" });
    const loginB = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);
    const response = await app.request("/api/pipeline", { headers: { cookie: cookieB } });
    expect(response.status).toBe(200);
    const board = (await response.json()) as PipelineBoardDto;
    expect(board.columns).toHaveLength(10);
    expect(allIds(board)).toEqual([]);
    expect(allIds(board)).not.toContain(secret.id);
  });

  it("rejeita prioridade inválida e exige sessão", async () => {
    const { app, cookie } = await login();
    const bad = await app.request("/api/pipeline?priority=critical", { headers: { cookie } });
    expect(bad.status).toBe(400);
    const anon = await app.request("/api/pipeline");
    expect(anon.status).toBe(401);
  });

  it("devolve ownerName, stageStatus e visualState no card", async () => {
    const { app, cookie } = await login(
      "owner@example.com",
      createTestDeps({ now: () => new Date("2026-08-19T12:00:00.000Z") }),
    );
    const client = await createClient(app, cookie);
    const created = await createProject(app, cookie, client.id, {
      name: "Atrasado",
      dueDate: "2026-08-01",
    });
    const activate = await app.request(`/api/projects/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });
    expect(activate.status).toBe(200);
    const waitStage = (await getProject(app, cookie, created.id)).stages.find((stage) => stage.isCurrent);
    expect(waitStage).toBeTruthy();
    if (waitStage) {
      const waited = await transition(app, cookie, created.id, waitStage.id, { action: "wait" });
      expect(waited.status).toBe(200);
    }

    const response = await app.request("/api/pipeline", { headers: { cookie } });
    const board = (await response.json()) as PipelineBoardDto;
    const card = board.columns.flatMap((column) => column.projects).find((project) => project.id === created.id) as
      | PipelineCardDto
      | undefined;
    expect(card).toMatchObject({
      clientName: "Cliente Board",
      ownerName: "Owner",
      currentStageKey: "briefing",
      currentStageLabel: "Briefing",
      stageStatus: "waiting",
      visualState: "overdue",
    });
  });
});
