import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { EXTERNAL_PARTICIPANT_REASON } from "../domain/meeting-type";

type ProjectDetail = {
  id: string;
  clientId: string;
  currentStageId: string | null;
  currentStageKey: string | null;
  stages: Array<{ id: string; key: string; status: string }>;
};

type MeetingDto = {
  id: string;
  title: string;
  type: string;
  decisions: string | null;
  participantUserIds: string[];
  projectId: string | null;
  clientId: string | null;
  validationId: string | null;
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

describe("meetings", () => {
  it("reunião de validação staging com decisão aparece na ficha e no histórico", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Com reunião");
    const createdValidation = await app.request(`/api/projects/${project.id}/validations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ type: "staging" }),
    });
    expect(createdValidation.status).toBe(201);
    const validation = (await createdValidation.json()) as { id: string };

    const created = await app.request("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        workspaceId: "ws-forjado",
        title: "Validação staging Acme",
        type: "staging_validation",
        startsAt: "2026-08-19T14:00:00.000Z",
        projectId: project.id,
        validationId: validation.id,
        participantUserIds: ["seed-user"],
        notes: "Walkthrough do ambiente",
        decisions: "Seguir para produção na sexta",
        nextSteps: "Abrir checklist de deploy",
      }),
    });
    expect(created.status).toBe(201);
    const meeting = (await created.json()) as MeetingDto;
    expect(meeting.type).toBe("staging_validation");
    expect(meeting.decisions).toBe("Seguir para produção na sexta");
    expect(meeting.validationId).toBe(validation.id);
    expect(meeting.participantUserIds).toEqual(["seed-user"]);

    const listed = await app.request(`/api/projects/${project.id}/meetings`, {
      headers: { cookie },
    });
    expect(listed.status).toBe(200);
    const rows = (await listed.json()) as MeetingDto[];
    expect(rows.some((row) => row.id === meeting.id)).toBe(true);

    const history = await app.request(`/api/projects/${project.id}/activity`, {
      headers: { cookie },
    });
    const events = (await history.json()) as ActivityDto[];
    const createdEvent = events.find((event) => event.action === "meeting.created");
    expect(createdEvent).toBeDefined();
    expect(createdEvent?.payload).toMatchObject({
      meetingId: meeting.id,
      type: "staging_validation",
      title: "Validação staging Acme",
    });
    expect(JSON.stringify(createdEvent?.payload)).not.toContain("Walkthrough");
    expect(JSON.stringify(createdEvent?.payload)).not.toContain("produção na sexta");
  });

  it("rejeita participante de fora do workspace", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Participante externo");
    const created = await app.request("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        title: "Kickoff",
        type: "kickoff",
        startsAt: "2026-08-19T15:00:00.000Z",
        projectId: project.id,
        participantUserIds: ["seed-user-b"],
      }),
    });
    expect(created.status).toBe(400);
    const body = (await created.json()) as { error: string; reason: string };
    expect(body.reason).toBe(EXTERNAL_PARTICIPANT_REASON);
    const listed = await app.request(`/api/projects/${project.id}/meetings`, {
      headers: { cookie },
    });
    await expect(listed.json()).resolves.toEqual([]);
  });

  it("não altera etapa nem abre blocker", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Etapa intacta");
    const briefing = project.stages.find((stage) => stage.key === "briefing");
    expect(briefing?.status).toBe("in_progress");

    const created = await app.request("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        title: "Kickoff",
        type: "kickoff",
        startsAt: "2026-08-19T16:00:00.000Z",
        projectId: project.id,
        stageId: briefing?.id,
        participantUserIds: ["seed-user", "member-user"],
      }),
    });
    expect(created.status).toBe(201);

    const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie } });
    const detail = (await ficha.json()) as ProjectDetail;
    expect(detail.currentStageKey).toBe("briefing");
    expect(detail.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

    const blockers = await app.request(`/api/projects/${project.id}/blockers`, {
      headers: { cookie },
    });
    await expect(blockers.json()).resolves.toEqual([]);
  });

  it("isola IDOR e collection de outro tenant", async () => {
    const deps = createTestDeps();
    const { app, cookie } = await login("owner@example.com", deps);
    const other = await login("owner-b@example.com", deps);
    const project = await createProject(app, cookie, "Tenant A");
    const created = await app.request("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        title: "Alinhamento",
        type: "scope_alignment",
        startsAt: "2026-08-19T17:00:00.000Z",
        projectId: project.id,
      }),
    });
    const meeting = (await created.json()) as MeetingDto;

    const listB = await other.app.request("/api/meetings", {
      headers: { cookie: other.cookie },
    });
    expect(listB.status).toBe(200);
    await expect(listB.json()).resolves.toEqual([]);

    const getB = await other.app.request(`/api/meetings/${meeting.id}`, {
      headers: { cookie: other.cookie },
    });
    expect(getB.status).toBe(404);
    expect(await getB.text()).toBe("");

    const patchB = await other.app.request(`/api/meetings/${meeting.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: other.cookie },
      body: JSON.stringify({ notes: "invasão" }),
    });
    expect(patchB.status).toBe(404);
    expect(await patchB.text()).toBe("");
  });

  it("PATCH atualiza decisões e ignora workspaceId", async () => {
    const { app, cookie } = await login("owner@example.com");
    const project = await createProject(app, cookie, "Patch reunião");
    const created = await app.request("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        title: "Entrega",
        type: "delivery",
        startsAt: "2026-08-20T10:00:00.000Z",
        projectId: project.id,
      }),
    });
    const meeting = (await created.json()) as MeetingDto;
    const patched = await app.request(`/api/meetings/${meeting.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        workspaceId: "ws-forjado",
        projectId: "ignored",
        decisions: "Cliente aceitou o go-live",
      }),
    });
    expect(patched.status).toBe(200);
    const body = (await patched.json()) as MeetingDto;
    expect(body.decisions).toBe("Cliente aceitou o go-live");
    expect(body.projectId).toBe(project.id);
  });
});
