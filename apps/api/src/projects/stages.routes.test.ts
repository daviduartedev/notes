import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { workflowTemplateIdOf } from "../test/templates";

type StageActionDto = {
  action: string;
  toKey: string | null;
  enabled: boolean;
  reason: string | null;
};

type StageDto = {
  id: string;
  key: string;
  status: string;
  isCurrent: boolean;
  allowedNextKeys: string[];
  actions: StageActionDto[];
};

type ProjectDetail = {
  id: string;
  currentStageId: string | null;
  currentStageKey: string | null;
  workflowTemplateId: string | null;
  stages: StageDto[];
};

type ActivityDto = { action: string; payload: Record<string, unknown> };

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

async function login(deps = createTestDeps()) {
  const app = createApp(deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@example.com", password: "changeme" }),
  });
  return { app, deps, cookie: cookieFrom(response) };
}

async function createClient(app: ReturnType<typeof createApp>, cookie: string, ownerUserId = "seed-user") {
  const response = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: "Cliente Pipeline", ownerUserId }),
  });
  return (await response.json()) as { id: string };
}

async function createProject(app: ReturnType<typeof createApp>, cookie: string, clientId: string) {
  const response = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: "SaaS", clientId, ownerUserId: "seed-user", workflowTemplateId: await workflowTemplateIdOf(app, cookie) }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as ProjectDetail;
}

async function getProject(app: ReturnType<typeof createApp>, cookie: string, id: string) {
  const response = await app.request(`/api/projects/${id}`, { headers: { cookie } });
  expect(response.status).toBe(200);
  return (await response.json()) as ProjectDetail;
}

async function getActivity(app: ReturnType<typeof createApp>, cookie: string, id: string) {
  const response = await app.request(`/api/projects/${id}/activity`, { headers: { cookie } });
  expect(response.status).toBe(200);
  return (await response.json()) as ActivityDto[];
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

describe("etapas e transições", () => {
  it("copia as 10 etapas do template SaaS na criação", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const project = await createProject(app, cookie, client.id);
    expect(project.stages).toHaveLength(10);
    expect(project.stages.map((stage) => stage.key)).toEqual([
      "briefing",
      "proposal",
      "waiting_client",
      "kickoff",
      "ux",
      "prototype",
      "design_handoff",
      "development",
      "staging",
      "production",
    ]);
    expect(project.currentStageKey).toBe("briefing");
    expect(project.stages[0]?.status).toBe("in_progress");
    expect(project.stages.slice(1).every((stage) => stage.status === "pending")).toBe(true);
    const activity = await getActivity(app, cookie, project.id);
    expect(activity.some((event) => event.action === "stage.started" && event.payload.key === "briefing")).toBe(
      true,
    );
  });

  it("avança etapa válida e registra de/para", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const created = await createProject(app, cookie, client.id);
    const atUx = await advanceTo(app, cookie, created.id, "ux");
    const ux = atUx.stages.find((stage) => stage.key === "ux");
    expect(ux).toBeDefined();
    if (!ux) return;
    const response = await transition(app, cookie, created.id, ux.id, {
      action: "complete",
      to: "prototype",
    });
    expect(response.status).toBe(200);
    const updated = (await response.json()) as ProjectDetail;
    expect(updated.currentStageKey).toBe("prototype");
    const activity = await getActivity(app, cookie, created.id);
    const moved = activity.find((event) => event.action === "stage.transitioned");
    expect(moved?.payload).toMatchObject({ from: "ux", to: "prototype" });
  });

  it("rejeita pulo ilegal sem gravar event de transição", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const project = await createProject(app, cookie, client.id);
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing).toBeDefined();
    if (!briefing) return;
    const before = await getActivity(app, cookie, project.id);
    const response = await transition(app, cookie, project.id, briefing.id, {
      action: "complete",
      to: "kickoff",
    });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Transição inválida",
      reason: "Não há aresta de briefing para kickoff",
    });
    const after = await getActivity(app, cookie, project.id);
    expect(after.filter((event) => event.action === "stage.transitioned")).toHaveLength(
      before.filter((event) => event.action === "stage.transitioned").length,
    );
    const still = await getProject(app, cookie, project.id);
    expect(still.currentStageKey).toBe("briefing");
  });

  it("não completa etapa blocked", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const project = await createProject(app, cookie, client.id);
    const briefing = project.stages.find((stage) => stage.isCurrent);
    expect(briefing).toBeDefined();
    if (!briefing) return;
    const blocked = await transition(app, cookie, project.id, briefing.id, { action: "block" });
    expect(blocked.status).toBe(200);
    const complete = await transition(app, cookie, project.id, briefing.id, {
      action: "complete",
      to: "proposal",
    });
    expect(complete.status).toBe(409);
    await expect(complete.json()).resolves.toMatchObject({
      reason: "Etapa bloqueada não pode ser concluída",
    });
  });

  it("ignora PATCH de currentStageId", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const project = await createProject(app, cookie, client.id);
    const production = project.stages.find((stage) => stage.key === "production");
    const patched = await app.request(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ currentStageId: production?.id }),
    });
    expect(patched.status).toBe(200);
    const updated = (await patched.json()) as ProjectDetail;
    expect(updated.currentStageId).toBe(project.currentStageId);
    expect(updated.currentStageKey).toBe("briefing");
  });

  it("template editado depois não muda stages do projeto antigo", async () => {
    const { app, deps, cookie } = await login();
    const client = await createClient(app, cookie);
    const project = await createProject(app, cookie, client.id);
    expect(project.workflowTemplateId).toBeTruthy();
    if (!project.workflowTemplateId) return;
    await deps.store.updateStageTemplateAllowedNextKeys(project.workflowTemplateId, "briefing", [
      "production",
    ]);
    const again = await getProject(app, cookie, project.id);
    const briefing = again.stages.find((stage) => stage.key === "briefing");
    expect(briefing?.allowedNextKeys).toEqual(["proposal"]);
  });

  it("IDOR de transição retorna 404 vazio", async () => {
    const a = await login();
    const client = await createClient(a.app, a.cookie);
    const project = await createProject(a.app, a.cookie, client.id);
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing).toBeDefined();
    if (!briefing) return;
    const loginB = await a.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);
    const idor = await transition(a.app, cookieB, project.id, briefing.id, {
      action: "complete",
      to: "proposal",
    });
    expect(idor.status).toBe(404);
    expect(await idor.text()).toBe("");
  });

  it("membro do workspace pode transicionar", async () => {
    const owner = await login();
    const client = await createClient(owner.app, owner.cookie);
    const project = await createProject(owner.app, owner.cookie, client.id);
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing).toBeDefined();
    if (!briefing) return;
    const memberLogin = await owner.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "member@example.com", password: "changeme" }),
    });
    const memberCookie = cookieFrom(memberLogin);
    const response = await transition(owner.app, memberCookie, project.id, briefing.id, {
      to: "proposal",
    });
    expect(response.status).toBe(200);
    const updated = (await response.json()) as ProjectDetail;
    expect(updated.currentStageKey).toBe("proposal");
  });
});
