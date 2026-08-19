import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";

type TemplateDto = {
  id: string;
  name: string;
  items: Array<{ id: string; title: string; order: number }>;
};

type ChecklistDto = {
  id: string;
  projectId: string;
  name: string;
  validationId: string | null;
  items: Array<{
    id: string;
    title: string;
    completedAt: string | null;
    completedByUserId: string | null;
    note: string | null;
  }>;
};

type ProjectDetail = {
  id: string;
  currentStageId: string | null;
  stages: Array<{ id: string; key: string; status: string }>;
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
    body: JSON.stringify({ name, clientId: client.id, ownerUserId: "seed-user" }),
  });
  expect(projectRes.status).toBe(201);
  return (await projectRes.json()) as ProjectDetail;
}

describe("checklists", () => {
  it("aplica o mesmo template em dois projetos e mutar o molde não altera instâncias", async () => {
    const { app, cookie } = await login("owner@example.com");
    const templatesRes = await app.request("/api/checklist-templates", { headers: { cookie } });
    expect(templatesRes.status).toBe(200);
    const templates = (await templatesRes.json()) as TemplateDto[];
    const template = templates.find((row) => row.name === "Deploy Staging SaaS");
    expect(template).toBeDefined();
    expect(template?.items).toHaveLength(8);
    if (!template) return;

    const projectA = await createProject(app, cookie, "Proj A");
    const projectB = await createProject(app, cookie, "Proj B");

    const applyA = await app.request(`/api/projects/${projectA.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ templateId: template.id, workspaceId: "ws-forjado" }),
    });
    const applyB = await app.request(`/api/projects/${projectB.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ templateId: template.id }),
    });
    expect(applyA.status).toBe(201);
    expect(applyB.status).toBe(201);
    const instanceA = (await applyA.json()) as ChecklistDto;
    const instanceB = (await applyB.json()) as ChecklistDto;
    expect(instanceA.id).not.toBe(instanceB.id);
    expect(instanceA.validationId).toBeNull();
    expect(instanceA.items.map((item) => item.title)[0]).toBe("Environment");
    expect(instanceB.items).toHaveLength(8);

    const firstItemId = template.items[0]?.id;
    expect(firstItemId).toBeDefined();
    const patched = await app.request(`/api/checklist-templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ items: [{ id: firstItemId, title: "Environment ALTERADO" }] }),
    });
    expect(patched.status).toBe(200);

    const listA = await app.request(`/api/projects/${projectA.id}/checklists`, { headers: { cookie } });
    const stillA = ((await listA.json()) as ChecklistDto[])[0];
    expect(stillA?.items[0]?.title).toBe("Environment");

    const history = await app.request(`/api/projects/${projectA.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "checklist.applied")).toBe(true);
  });

  it("marca item com responsável da sessão e não muda Stage.status", async () => {
    const now = new Date("2026-08-19T15:00:00.000Z");
    const { app, cookie } = await login("owner@example.com", createTestDeps({ now: () => now }));
    const templates = (await (
      await app.request("/api/checklist-templates", { headers: { cookie } })
    ).json()) as TemplateDto[];
    const template = templates[0];
    expect(template).toBeDefined();
    if (!template) return;
    const project = await createProject(app, cookie, "Com etapa");
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing?.status).toBe("in_progress");

    const applied = await app.request(`/api/projects/${project.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ templateId: template.id, stageId: briefing?.id }),
    });
    const checklist = (await applied.json()) as ChecklistDto;
    const item = checklist.items[0];
    expect(item).toBeDefined();
    if (!item) return;

    const complete = await app.request(`/api/checklist-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ completed: true, note: "ok" }),
    });
    expect(complete.status).toBe(200);
    const updated = (await complete.json()) as {
      completedAt: string | null;
      completedByUserId: string | null;
      note: string | null;
    };
    expect(updated.completedByUserId).toBe("seed-user");
    expect(updated.completedAt).toBe(now.toISOString());
    expect(updated.note).toBe("ok");

    const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie } });
    const after = (await ficha.json()) as ProjectDetail;
    expect(after.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "checklist.item_completed")).toBe(true);
  });

  it("IDOR de item e collection vazia no workspace B", async () => {
    const { app, cookie } = await login("owner@example.com");
    const templates = (await (
      await app.request("/api/checklist-templates", { headers: { cookie } })
    ).json()) as TemplateDto[];
    const project = await createProject(app, cookie, "Privado");
    const applied = await app.request(`/api/projects/${project.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ templateId: templates[0]?.id }),
    });
    const checklist = (await applied.json()) as ChecklistDto;
    const itemId = checklist.items[0]?.id;
    expect(itemId).toBeDefined();

    const loginB = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);
    const idor = await app.request(`/api/checklist-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: cookieB },
      body: JSON.stringify({ completed: true }),
    });
    expect(idor.status).toBe(404);
    expect(await idor.text()).toBe("");

    const listB = await app.request("/api/checklists", { headers: { cookie: cookieB } });
    expect(listB.status).toBe(200);
    expect(await listB.json()).toEqual([]);
  });

  it("member aplica e marca, mas não edita template", async () => {
    const owner = await login("owner@example.com");
    const templates = (await (
      await owner.app.request("/api/checklist-templates", { headers: { cookie: owner.cookie } })
    ).json()) as TemplateDto[];
    const project = await createProject(owner.app, owner.cookie, "Member apply");

    const memberLogin = await owner.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "member@example.com", password: "changeme" }),
    });
    const memberCookie = cookieFrom(memberLogin);

    const apply = await owner.app.request(`/api/projects/${project.id}/checklists/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: memberCookie },
      body: JSON.stringify({ templateId: templates[0]?.id }),
    });
    expect(apply.status).toBe(201);
    const checklist = (await apply.json()) as ChecklistDto;

    const mark = await owner.app.request(`/api/checklist-items/${checklist.items[0]?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: memberCookie },
      body: JSON.stringify({ completed: true }),
    });
    expect(mark.status).toBe(200);

    const forbidden = await owner.app.request(`/api/checklist-templates/${templates[0]?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: memberCookie },
      body: JSON.stringify({ name: "Hack" }),
    });
    expect(forbidden.status).toBe(403);
  });
});
