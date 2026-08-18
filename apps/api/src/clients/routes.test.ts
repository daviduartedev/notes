import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { SESSION_COOKIE } from "../auth/session";

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

async function login(email: string, password: string, deps = createTestDeps()) {
  const app = createApp(deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return { app, deps, cookie: cookieFrom(response), status: response.status };
}

async function createClient(
  app: ReturnType<typeof createApp>,
  cookie: string,
  body: Record<string, unknown>,
) {
  return app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });
}

describe("clientes", () => {
  it("CORS permite PATCH PUT DELETE", async () => {
    const app = createApp(createTestDeps());
    const response = await app.request("/api/clients", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3015",
        "Access-Control-Request-Method": "PATCH",
      },
    });
    const allow = (response.headers.get("access-control-allow-methods") ?? "").toUpperCase();
    expect(allow).toContain("PATCH");
    expect(allow).toContain("PUT");
    expect(allow).toContain("DELETE");
  });

  it("lista membros do workspace da sessão", async () => {
    const { app, cookie } = await login("owner@example.com", "changeme");
    const response = await app.request("/api/workspace/members", { headers: { cookie } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "seed-user", email: "owner@example.com" }),
        expect.objectContaining({ id: "member-user", email: "member@example.com" }),
      ]),
    );
  });

  it("cria cliente no workspace da sessão e ignora workspaceId/createdAt do body", async () => {
    const { app, cookie } = await login("owner@example.com", "changeme");
    const response = await createClient(app, cookie, {
      name: "Acme",
      ownerUserId: "seed-user",
      workspaceId: "ws-evil",
      createdAt: "2000-01-01T00:00:00.000Z",
      status: "lead",
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as { workspaceId: string; createdAt: string; name: string };
    expect(body.workspaceId).toBe("ws-1");
    expect(body.createdAt.startsWith("2000")).toBe(false);
    expect(body.name).toBe("Acme");
  });

  it("rejeita status inicial diferente de lead", async () => {
    const { app, cookie } = await login("owner@example.com", "changeme");
    const response = await createClient(app, cookie, {
      name: "Acme",
      ownerUserId: "seed-user",
      status: "active",
    });
    expect(response.status).toBe(400);
  });

  it("rejeita responsável que não é membro", async () => {
    const { app, cookie } = await login("owner@example.com", "changeme");
    const response = await createClient(app, cookie, {
      name: "Acme",
      ownerUserId: "seed-user-b",
    });
    expect(response.status).toBe(400);
  });

  it("filtra clientes por nome, responsável e status", async () => {
    const { app, cookie } = await login("owner@example.com", "changeme");
    await createClient(app, cookie, { name: "Alpha Ltda", ownerUserId: "seed-user" });
    await createClient(app, cookie, { name: "Beta SA", ownerUserId: "member-user" });
    const created = await createClient(app, cookie, { name: "Gamma", ownerUserId: "seed-user" });
    const gamma = (await created.json()) as { id: string };
    await app.request(`/api/clients/${gamma.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });

    const byName = await app.request("/api/clients?name=alpha", { headers: { cookie } });
    const names = (await byName.json()) as { name: string }[];
    expect(names.map((row) => row.name)).toEqual(["Alpha Ltda"]);

    const byOwner = await app.request("/api/clients?ownerUserId=member-user", { headers: { cookie } });
    const owners = (await byOwner.json()) as { name: string }[];
    expect(owners.map((row) => row.name)).toEqual(["Beta SA"]);

    const byStatus = await app.request("/api/clients?status=active", { headers: { cookie } });
    const statuses = (await byStatus.json()) as { name: string }[];
    expect(statuses.map((row) => row.name)).toEqual(["Gamma"]);
  });

  it("rejeita transição inválida de status", async () => {
    const { app, cookie } = await login("owner@example.com", "changeme");
    const created = await createClient(app, cookie, { name: "Arquivar", ownerUserId: "seed-user" });
    const client = (await created.json()) as { id: string };
    const archive = await app.request(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "archived" }),
    });
    expect(archive.status).toBe(200);
    const invalid = await app.request(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });
    expect(invalid.status).toBe(409);
    await expect(invalid.json()).resolves.toEqual({ error: "Transição inválida" });
  });

  it("membro de outro workspace recebe 404 vazio", async () => {
    const a = await login("owner@example.com", "changeme");
    const created = await createClient(a.app, a.cookie, { name: "Segredo", ownerUserId: "seed-user" });
    const client = (await created.json()) as { id: string };

    const b = await login("owner-b@example.com", "changeme", a.deps);
    const response = await b.app.request(`/api/clients/${client.id}`, {
      headers: { cookie: b.cookie },
    });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });

  it("sem membership recebe 403", async () => {
    const { app, cookie } = await login("nomember@example.com", "changeme");
    const response = await app.request("/api/clients", { headers: { cookie } });
    expect(response.status).toBe(403);
  });

  it("cookie de sessão está presente no login usado pelos clientes", async () => {
    const { cookie, status } = await login("owner@example.com", "changeme");
    expect(status).toBe(200);
    expect(cookie).toContain(SESSION_COOKIE);
  });
});
