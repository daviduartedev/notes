import { describe, expect, it } from "vitest";
import { API_PORT, createApp } from "./app";
import { createTestDeps, testDeps } from "./deps";
import { SESSION_COOKIE } from "./auth/session";

function cookieFrom(response: Response): string {
  const header = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie") ?? "";
  return header.split(";")[0] ?? "";
}

async function login(
  email: string,
  password: string,
  deps = testDeps,
): Promise<{ status: number; cookie: string; response: Response }> {
  const app = createApp(deps);
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return { status: response.status, cookie: cookieFrom(response), response };
}

describe("API scaffold", () => {
  it("usa a porta 3014", () => {
    expect(API_PORT).toBe(3014);
  });

  it("responde na raiz", async () => {
    const app = createApp(testDeps);
    const response = await app.request("/");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ service: "notes-api" });
  });

  it("health responde ok", async () => {
    const app = createApp(testDeps);
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});

describe("auth credentials", () => {
  it("faz login e devolve cookie HttpOnly", async () => {
    const { status, cookie, response } = await login("owner@example.com", "changeme");
    expect(status).toBe(200);
    expect(cookie).toContain(SESSION_COOKIE);
    expect((response.headers.get("set-cookie") ?? "").toLowerCase()).toContain("httponly");
  });

  it("rejeita senha inválida", async () => {
    const { status, response } = await login("owner@example.com", "wrong");
    expect(status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Credenciais inválidas" });
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("logout limpa o cookie", async () => {
    const app = createApp(testDeps);
    const response = await app.request("/api/auth/logout", { method: "POST" });
    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(SESSION_COOKIE);
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
  });

  it("após logout o cookie jar e o JWT antigo falham em /api/me", async () => {
    const deps = createTestDeps();
    const { cookie } = await login("owner@example.com", "changeme", deps);
    const app = createApp(deps);

    const before = await app.request("/api/me", { headers: { cookie } });
    expect(before.status).toBe(200);

    const logout = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { cookie },
    });
    expect(logout.status).toBe(200);

    const jarCookie = cookieFrom(logout);
    const afterJar = await app.request("/api/me", { headers: { cookie: jarCookie } });
    expect(afterJar.status).toBe(401);

    const replay = await app.request("/api/me", { headers: { cookie } });
    expect(replay.status).toBe(401);
  });
});

describe("membership e workspace", () => {
  it("GET /api/me exige membership", async () => {
    const { cookie } = await login("nomember@example.com", "changeme");
    const app = createApp(testDeps);
    const response = await app.request("/api/me", { headers: { cookie } });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Sem permissão" });
  });

  it("GET /api/me devolve o owner seed", async () => {
    const { cookie } = await login("owner@example.com", "changeme");
    const app = createApp(testDeps);
    const response = await app.request("/api/me", { headers: { cookie } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      email: "owner@example.com",
      role: "owner",
      workspaceId: "ws-1",
    });
  });

  it("GET /api/workspace exige membership", async () => {
    const { cookie } = await login("nomember@example.com", "changeme");
    const app = createApp(testDeps);
    const response = await app.request("/api/workspace", { headers: { cookie } });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Sem permissão" });
  });

  it("GET /api/workspace ignora query e usa a sessão", async () => {
    const { cookie } = await login("owner@example.com", "changeme");
    const app = createApp(testDeps);
    const response = await app.request("/api/workspace?workspaceId=ws-evil", {
      headers: { cookie },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "ws-1",
      name: "Notes",
      attentionLeadDays: 3,
    });
  });

  it("GET /api/workspace/:id do tenant da sessão é 200 e o de outro tenant é 404 vazio", async () => {
    const { cookie } = await login("owner@example.com", "changeme");
    const app = createApp(testDeps);

    const own = await app.request("/api/workspace/ws-1", { headers: { cookie } });
    expect(own.status).toBe(200);
    await expect(own.json()).resolves.toEqual({
      id: "ws-1",
      name: "Notes",
      attentionLeadDays: 3,
    });

    const other = await app.request("/api/workspace/ws-2", { headers: { cookie } });
    expect(other.status).toBe(404);
    expect(await other.text()).toBe("");
  });

  it("PATCH /api/workspace persiste antecedência e ignora workspaceId do body", async () => {
    const { cookie } = await login("owner@example.com", "changeme");
    const app = createApp(createTestDeps());
    const patched = await app.request("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ attentionLeadDays: 5, workspaceId: "ws-evil" }),
    });
    expect(patched.status).toBe(200);
    await expect(patched.json()).resolves.toEqual({
      id: "ws-1",
      name: "Notes",
      attentionLeadDays: 5,
    });
    const again = await app.request("/api/workspace", { headers: { cookie } });
    await expect(again.json()).resolves.toMatchObject({ attentionLeadDays: 5 });
  });
});
