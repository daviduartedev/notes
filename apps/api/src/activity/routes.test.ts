import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { workflowTemplateIdOf } from "../test/templates";

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

async function login() {
  const deps = createTestDeps();
  const app = createApp(deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@example.com", password: "changeme" }),
  });
  return { app, deps, cookie: cookieFrom(response) };
}

describe("activity", () => {
  it("registra project.created duas vezes no histórico do cliente sem PII", async () => {
    const { app, cookie } = await login();
    const clientRes = await app.request("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Cliente Log",
        ownerUserId: "seed-user",
        email: "secret@example.com",
        whatsapp: "11999999999",
      }),
    });
    const client = (await clientRes.json()) as { id: string };

    await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ name: "P1", clientId: client.id, ownerUserId: "seed-user", workflowTemplateId: await workflowTemplateIdOf(app, cookie) }),
    });
    await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ name: "P2", clientId: client.id, ownerUserId: "seed-user", workflowTemplateId: await workflowTemplateIdOf(app, cookie) }),
    });

    const history = await app.request(`/api/clients/${client.id}/activity`, { headers: { cookie } });
    expect(history.status).toBe(200);
    const events = (await history.json()) as {
      action: string;
      payload: Record<string, unknown>;
    }[];
    const created = events.filter((event) => event.action === "project.created");
    expect(created).toHaveLength(2);
    expect(created[0]?.payload).toMatchObject({ name: expect.any(String), clientId: client.id });
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("secret@example.com");
    expect(serialized).not.toContain("11999999999");
    expect(events.some((event) => event.action === "client.created")).toBe(true);
  });

  it("activity de outro tenant é 404 vazio", async () => {
    const { app, cookie } = await login();
    const clientRes = await app.request("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ name: "A", ownerUserId: "seed-user" }),
    });
    const client = (await clientRes.json()) as { id: string };
    const loginB = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);
    const response = await app.request(`/api/clients/${client.id}/activity`, {
      headers: { cookie: cookieB },
    });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
