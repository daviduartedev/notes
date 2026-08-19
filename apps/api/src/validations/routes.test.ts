import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";

type ProjectDetail = {
  id: string;
  currentStageId: string | null;
  stages: Array<{ id: string; key: string; status: string }>;
};

type ValidationDto = {
  id: string;
  status: string;
  visualState: string | null;
  checklistId: string | null;
  requesterUserId: string;
  allowedTransitions: string[];
};

type ActivityDto = { action: string; payload: Record<string, unknown> };

type ChecklistDto = { id: string; validationId: string | null };

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
    body: JSON.stringify({ name, clientId: client.id, ownerUserId: "seed-user" }),
  });
  expect(projectRes.status).toBe(201);
  return (await projectRes.json()) as ProjectDetail;
}

async function createDraft(
  app: ReturnType<typeof createApp>,
  cookie: string,
  projectId: string,
  extra: Record<string, unknown> = {},
) {
  const created = await app.request(`/api/projects/${projectId}/validations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ type: "staging", workspaceId: "ws-forjado", ...extra }),
  });
  expect(created.status).toBe(201);
  return (await created.json()) as ValidationDto;
}

async function transition(
  app: ReturnType<typeof createApp>,
  cookie: string,
  id: string,
  to: string,
  extra: Record<string, unknown> = {},
) {
  return app.request(`/api/validations/${id}/transition`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ to, ...extra }),
  });
}

describe("validations", () => {
  it("in_review → changes_requested grava activity e não cria Approval nem muda etapa", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Com validação");
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing?.status).toBe("in_progress");
    const draft = await createDraft(app, cookie, project.id, { stageId: briefing?.id });

    expect((await transition(app, cookie, draft.id, "requested")).status).toBe(200);
    expect((await transition(app, cookie, draft.id, "in_review")).status).toBe(200);
    const adjusted = await transition(app, cookie, draft.id, "changes_requested");
    expect(adjusted.status).toBe(200);
    const dto = (await adjusted.json()) as ValidationDto;
    expect(dto.status).toBe("changes_requested");

    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "validation.changes_requested")).toBe(true);
    expect(events.some((event) => event.action.startsWith("approval."))).toBe(false);

    const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie } });
    const after = (await ficha.json()) as ProjectDetail;
    expect(after.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

    const missingApproval = await app.request("/api/approvals", { headers: { cookie } });
    expect(missingApproval.status).toBe(404);
  });

  it("rejeita transição ilegal com 409 e sem event", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Ilegal");
    const draft = await createDraft(app, cookie, project.id);
    const illegal = await transition(app, cookie, draft.id, "approved");
    expect(illegal.status).toBe(409);
    const still = await app.request(`/api/validations/${draft.id}`, { headers: { cookie } });
    await expect(still.json()).resolves.toMatchObject({ status: "draft" });
    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.filter((event) => event.action.startsWith("validation."))).toHaveLength(0);
  });

  it("marca overdue quando o prazo venceu e o status não é terminal", async () => {
    const now = new Date("2026-08-19T16:00:00.000Z");
    const { app, cookie } = await login("owner@example.com", createTestDeps({ now: () => now }));
    const project = await createProject(app, cookie, "Atrasada");
    const draft = await createDraft(app, cookie, project.id, {
      dueDate: "2026-08-01T00:00:00.000Z",
    });
    await transition(app, cookie, draft.id, "requested");
    const requested = await app.request(`/api/validations/${draft.id}`, { headers: { cookie } });
    await expect(requested.json()).resolves.toMatchObject({
      status: "requested",
      visualState: "overdue",
    });
  });

  it("não marca overdue em status terminal", async () => {
    const now = new Date("2026-08-19T16:00:00.000Z");
    const { app, cookie } = await login("owner@example.com", createTestDeps({ now: () => now }));
    const project = await createProject(app, cookie, "Terminal");
    const draft = await createDraft(app, cookie, project.id, {
      dueDate: "2026-08-01T00:00:00.000Z",
    });
    await transition(app, cookie, draft.id, "requested");
    await transition(app, cookie, draft.id, "in_review");
    await transition(app, cookie, draft.id, "approved");
    const approved = await app.request(`/api/validations/${draft.id}`, { headers: { cookie } });
    await expect(approved.json()).resolves.toMatchObject({
      status: "approved",
      visualState: null,
    });
  });

  it("IDOR devolve 404 vazio e collection do workspace B vem vazia", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Privado");
    const draft = await createDraft(app, cookie, project.id);

    const loginB = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);

    const getB = await app.request(`/api/validations/${draft.id}`, { headers: { cookie: cookieB } });
    expect(getB.status).toBe(404);
    expect(await getB.text()).toBe("");

    const transB = await transition(app, cookieB, draft.id, "requested");
    expect(transB.status).toBe(404);
    expect(await transB.text()).toBe("");

    const listB = await app.request("/api/validations", { headers: { cookie: cookieB } });
    expect(listB.status).toBe(200);
    await expect(listB.json()).resolves.toEqual([]);
  });

  it("PATCH ignora status no body", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Patch");
    const draft = await createDraft(app, cookie, project.id);
    const patched = await app.request(`/api/validations/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "approved", notes: "obs" }),
    });
    expect(patched.status).toBe(200);
    await expect(patched.json()).resolves.toMatchObject({ status: "draft", notes: "obs" });
  });

  it("liga checklist opcional preenchendo validationId", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Com checklist");
    const templates = (await (
      await app.request("/api/checklist-templates", { headers: { cookie } })
    ).json()) as Array<{ id: string }>;
    const applied = await app.request(`/api/projects/${project.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ templateId: templates[0]?.id }),
    });
    const checklist = (await applied.json()) as ChecklistDto;
    const draft = await createDraft(app, cookie, project.id, { checklistId: checklist.id });
    expect(draft.checklistId).toBe(checklist.id);
    const list = await app.request(`/api/projects/${project.id}/checklists`, { headers: { cookie } });
    const rows = (await list.json()) as ChecklistDto[];
    expect(rows[0]?.validationId).toBe(draft.id);
  });
});
