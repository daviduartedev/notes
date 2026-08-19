import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";

type ProjectDetail = {
  id: string;
  clientId: string;
  status: string;
  currentStageId: string | null;
  stages: Array<{ id: string; key: string; status: string }>;
};

type ApprovalDto = {
  id: string;
  status: string;
  kind: string;
  approverId: string | null;
  decidedAt: string | null;
  revokedAt: string | null;
  comment: string | null;
  projectSnapshot: {
    currentStageKey: string | null;
    projectStatus: string;
    validationId: string | null;
    projectId: string;
    clientId: string;
  };
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
    body: JSON.stringify({ name, clientId: client.id, ownerUserId: "seed-user" }),
  });
  expect(projectRes.status).toBe(201);
  return (await projectRes.json()) as ProjectDetail;
}

async function createPending(
  app: ReturnType<typeof createApp>,
  cookie: string,
  projectId: string,
  extra: Record<string, unknown> = {},
) {
  const created = await app.request("/api/approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ projectId, kind: "staging", workspaceId: "ws-forjado", ...extra }),
  });
  expect(created.status).toBe(201);
  return (await created.json()) as ApprovalDto;
}

async function decide(
  app: ReturnType<typeof createApp>,
  cookie: string,
  id: string,
  action: string,
  extra: Record<string, unknown> = {},
) {
  return app.request(`/api/approvals/${id}/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ action, ...extra }),
  });
}

describe("approvals", () => {
  it("grant de staging grava approver, timestamp e snapshot sem avançar etapa", async () => {
    const now = new Date("2026-08-19T16:00:00.000Z");
    const { app, cookie } = await login("owner@example.com", createTestDeps({ now: () => now }));
    const project = await createProject(app, cookie, "Com aprovação");
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing?.status).toBe("in_progress");

    const pending = await createPending(app, cookie, project.id, {
      approverId: "forged-user",
      comment: "ok staging",
    });
    expect(pending.status).toBe("pending");
    expect(pending.approverId).toBeNull();
    expect(pending.projectSnapshot).toMatchObject({
      currentStageKey: "briefing",
      projectStatus: project.status,
      validationId: null,
      projectId: project.id,
      clientId: project.clientId,
    });

    const granted = await decide(app, cookie, pending.id, "grant", { approverId: "forged-user" });
    expect(granted.status).toBe(200);
    const dto = (await granted.json()) as ApprovalDto;
    expect(dto.status).toBe("granted");
    expect(dto.approverId).toBe("seed-user");
    expect(dto.decidedAt).toBe(now.toISOString());
    expect(dto.projectSnapshot.currentStageKey).toBe("briefing");
    expect(dto.kind).toBe("staging");

    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "approval.granted")).toBe(true);

    const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie } });
    const after = (await ficha.json()) as ProjectDetail;
    expect(after.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");
  });

  it("revoke não apaga o registro granted original", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Revogar");
    const pending = await createPending(app, cookie, project.id);
    const grantedRes = await decide(app, cookie, pending.id, "grant");
    const granted = (await grantedRes.json()) as ApprovalDto;
    const snapshot = granted.projectSnapshot;
    const decidedAt = granted.decidedAt;

    const revokedRes = await decide(app, cookie, pending.id, "revoke");
    expect(revokedRes.status).toBe(200);
    const revoked = (await revokedRes.json()) as ApprovalDto;
    expect(revoked.id).toBe(pending.id);
    expect(revoked.status).toBe("revoked");
    expect(revoked.decidedAt).toBe(decidedAt);
    expect(revoked.revokedAt).toBeTruthy();
    expect(revoked.projectSnapshot).toEqual(snapshot);
    expect(revoked.approverId).toBe("seed-user");

    const still = await app.request(`/api/approvals/${pending.id}`, { headers: { cookie } });
    expect(still.status).toBe(200);
    await expect(still.json()).resolves.toMatchObject({ id: pending.id, status: "revoked" });

    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "approval.revoked")).toBe(true);
  });

  it("rejeita decisão ilegal com 409 e sem event", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Ilegal");
    const pending = await createPending(app, cookie, project.id);
    const illegal = await decide(app, cookie, pending.id, "revoke");
    expect(illegal.status).toBe(409);
    const still = await app.request(`/api/approvals/${pending.id}`, { headers: { cookie } });
    await expect(still.json()).resolves.toMatchObject({ status: "pending" });
    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.filter((event) => event.action.startsWith("approval."))).toHaveLength(0);
  });

  it("IDOR devolve 404 vazio e collection do workspace B vem vazia", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Privado");
    const pending = await createPending(app, cookie, project.id);

    const loginB = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);

    const getB = await app.request(`/api/approvals/${pending.id}`, { headers: { cookie: cookieB } });
    expect(getB.status).toBe(404);
    expect(await getB.text()).toBe("");

    const decideB = await decide(app, cookieB, pending.id, "grant");
    expect(decideB.status).toBe(404);
    expect(await decideB.text()).toBe("");

    const listB = await app.request("/api/approvals", { headers: { cookie: cookieB } });
    expect(listB.status).toBe(200);
    await expect(listB.json()).resolves.toEqual([]);
  });

  it("validação aprovada não cria Approval automaticamente", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "D8");
    const created = await app.request(`/api/projects/${project.id}/validations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ type: "staging" }),
    });
    const draft = (await created.json()) as { id: string };
    await app.request(`/api/validations/${draft.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ to: "requested" }),
    });
    await app.request(`/api/validations/${draft.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ to: "in_review" }),
    });
    const approved = await app.request(`/api/validations/${draft.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ to: "approved" }),
    });
    expect(approved.status).toBe(200);

    const list = await app.request("/api/approvals", { headers: { cookie } });
    expect(list.status).toBe(200);
    await expect(list.json()).resolves.toEqual([]);

    const history = await app.request(`/api/projects/${project.id}/activity`, { headers: { cookie } });
    const events = (await history.json()) as ActivityDto[];
    expect(events.some((event) => event.action === "validation.approved")).toBe(true);
    expect(events.some((event) => event.action.startsWith("approval."))).toBe(false);
  });
});
