import { describe, expect, it } from "vitest";
import { API_PORT, createApp } from "./app";
import { testDeps } from "./deps";
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
    expect(response.headers.get("set-cookie") ?? "").toContain(SESSION_COOKIE);
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

  it("GET /api/workspace ignora query e usa a sessão", async () => {
    const { cookie } = await login("owner@example.com", "changeme");
    const app = createApp(testDeps);
    const response = await app.request("/api/workspace?workspaceId=ws-evil", {
      headers: { cookie },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: "ws-1", name: "Notes" });
  });

  it("recurso de outro workspace retorna 404 vazio", async () => {
    const deps = {
      ...testDeps,
      authenticate: async () => ({
        userId: "u",
        email: "owner@example.com",
        workspaceId: "missing",
        role: "owner" as const,
      }),
      getWorkspace: async () => null,
    };
    const { cookie } = await login("owner@example.com", "changeme", deps);
    const app = createApp(deps);
    const response = await app.request("/api/workspace", { headers: { cookie } });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
