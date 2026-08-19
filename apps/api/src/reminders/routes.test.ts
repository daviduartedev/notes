import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { DEFAULT_SNOOZE_MS } from "../domain/reminder-status";
import { PROPOSAL_WAITING_CLIENT_POLICY } from "../domain/follow-up-policy";
import { workflowTemplateIdOf } from "../test/templates";

type ProjectDetail = {
  id: string;
  clientId: string;
  currentStageId: string | null;
  currentStageKey: string | null;
  lastInteractionAt?: string | null;
  stages: Array<{
    id: string;
    key: string;
    isCurrent?: boolean;
    status: string;
    actions: Array<{ action: string; enabled: boolean; toKey: string | null }>;
  }>;
};

type ReminderDto = {
  id: string;
  status: string;
  channel: string;
  policyKey: string | null;
  draftMessage: string;
  dueAt: string;
  allowedActions: string[];
  projectId: string | null;
};

type ActivityDto = { action: string; payload: Record<string, unknown> };

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
    advanceMs(ms: number) {
      now = new Date(now.getTime() + ms);
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
  ownerUserId = "seed-user",
) {
  const clientRes = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: `Cliente ${name}`, ownerUserId }),
  });
  const client = (await clientRes.json()) as { id: string };
  const projectRes = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name, clientId: client.id, ownerUserId, workflowTemplateId: await workflowTemplateIdOf(app, cookie) }),
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

describe("lembretes C8", () => {
  it("política dos 3 dias cria reminder due com relógio fake e não duplica", async () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const clock = clockDeps(start);
    const { app, cookie } = await login("owner@example.com", clock);
    const created = await createProject(app, cookie, "Proposta Acme");
    await advanceTo(app, cookie, created.id, "waiting_client");

    const early = await app.request("/api/reminders", { headers: { cookie } });
    expect(early.status).toBe(200);
    await expect(early.json()).resolves.toEqual([]);

    clock.setNow(new Date("2026-01-04T00:00:00.000Z"));
    const first = await app.request("/api/reminders", { headers: { cookie } });
    expect(first.status).toBe(200);
    const list = (await first.json()) as ReminderDto[];
    expect(list).toHaveLength(1);
    expect(list[0]?.status).toBe("due");
    expect(list[0]?.channel).toBe("internal");
    expect(list[0]?.policyKey).toBe(PROPOSAL_WAITING_CLIENT_POLICY);
    expect(list[0]?.draftMessage).toContain("proposta");
    expect(list[0]?.allowedActions).toEqual(["complete", "snooze", "cancel"]);

    const second = await app.request("/api/reminders", { headers: { cookie } });
    const again = (await second.json()) as ReminderDto[];
    expect(again).toHaveLength(1);
    expect(again[0]?.id).toBe(list[0]?.id);

    const activityRes = await app.request(`/api/projects/${created.id}/activity`, {
      headers: { cookie },
    });
    const events = (await activityRes.json()) as ActivityDto[];
    const createdEvent = events.find((event) => event.action === "reminder.created");
    expect(createdEvent).toBeDefined();
    expect(JSON.stringify(createdEvent?.payload)).not.toContain(list[0]?.draftMessage ?? "Olá,");
    expect(createdEvent?.payload.draftMessage).toBeUndefined();
  });

  it("complete marca enviado e snooze volta para scheduled +7d", async () => {
    const start = new Date("2026-02-01T00:00:00.000Z");
    const clock = clockDeps(start);
    const { app, cookie } = await login("owner@example.com", clock);
    const created = await createProject(app, cookie, "Snooze Acme");
    await advanceTo(app, cookie, created.id, "waiting_client");
    clock.setNow(new Date("2026-02-04T00:00:00.000Z"));
    const listed = (await (
      await app.request("/api/reminders", { headers: { cookie } })
    ).json()) as ReminderDto[];
    const due = listed[0];
    expect(due).toBeDefined();
    if (!due) return;

    const snoozed = await app.request(`/api/reminders/${due.id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ action: "snooze", workspaceId: "forjado" }),
    });
    expect(snoozed.status).toBe(200);
    const snoozeBody = (await snoozed.json()) as ReminderDto;
    expect(snoozeBody.status).toBe("scheduled");
    expect(new Date(snoozeBody.dueAt).getTime()).toBe(
      new Date("2026-02-04T00:00:00.000Z").getTime() + DEFAULT_SNOOZE_MS,
    );

    clock.setNow(new Date(snoozeBody.dueAt));
    const promoted = (await (
      await app.request("/api/reminders", { headers: { cookie } })
    ).json()) as ReminderDto[];
    const dueAgain = promoted.find((row) => row.id === due.id);
    expect(dueAgain?.status).toBe("due");

    const done = await app.request(`/api/reminders/${due.id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ action: "complete" }),
    });
    expect(done.status).toBe(200);
    const doneBody = (await done.json()) as ReminderDto;
    expect(doneBody.status).toBe("done");

    const illegal = await app.request(`/api/reminders/${due.id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ action: "complete" }),
    });
    expect(illegal.status).toBe(409);
    const activityRes = await app.request(`/api/projects/${created.id}/activity`, {
      headers: { cookie },
    });
    const events = (await activityRes.json()) as ActivityDto[];
    expect(events.filter((event) => event.action === "reminder.completed")).toHaveLength(1);
  });

  it("isola tenant: GET/decide 404 e collection vazia", async () => {
    const start = new Date("2026-03-01T00:00:00.000Z");
    const clock = clockDeps(start);
    const a = await login("owner@example.com", clock);
    const created = await createProject(a.app, a.cookie, "Tenant A");
    await advanceTo(a.app, a.cookie, created.id, "waiting_client");
    clock.setNow(new Date("2026-03-04T00:00:00.000Z"));
    const listed = (await (
      await a.app.request("/api/reminders", { headers: { cookie: a.cookie } })
    ).json()) as ReminderDto[];
    const reminder = listed[0];
    expect(reminder).toBeDefined();
    if (!reminder) return;

    const b = await login("owner-b@example.com", clock);
    const collection = await b.app.request("/api/reminders", { headers: { cookie: b.cookie } });
    expect(collection.status).toBe(200);
    await expect(collection.json()).resolves.toEqual([]);

    const idor = await b.app.request(`/api/reminders/${reminder.id}`, {
      headers: { cookie: b.cookie },
    });
    expect(idor.status).toBe(404);
    expect(await idor.text()).toBe("");

    const decide = await b.app.request(`/api/reminders/${reminder.id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: b.cookie },
      body: JSON.stringify({ action: "complete" }),
    });
    expect(decide.status).toBe(404);
    expect(await decide.text()).toBe("");
  });
});
