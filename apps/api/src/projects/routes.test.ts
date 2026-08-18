import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";

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

async function createClient(app: ReturnType<typeof createApp>, cookie: string) {
  const response = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: "Cliente X", ownerUserId: "seed-user" }),
  });
  return (await response.json()) as { id: string; name: string };
}

describe("projetos", () => {
  it("cria dois projetos no mesmo cliente e lista em filtros", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const first = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Site",
        clientId: client.id,
        ownerUserId: "seed-user",
        workspaceId: "ws-evil",
      }),
    });
    const second = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "App",
        clientId: client.id,
        ownerUserId: "member-user",
        priority: "high",
      }),
    });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const created = (await first.json()) as { workspaceId: string; status: string };
    expect(created.workspaceId).toBe("ws-1");
    expect(created.status).toBe("draft");

    const listed = await app.request(`/api/projects?clientId=${client.id}`, { headers: { cookie } });
    const rows = (await listed.json()) as { name: string }[];
    expect(rows.map((row) => row.name).sort()).toEqual(["App", "Site"]);

    const byOwner = await app.request("/api/projects?ownerUserId=member-user", { headers: { cookie } });
    const owned = (await byOwner.json()) as { name: string }[];
    expect(owned.map((row) => row.name)).toEqual(["App"]);
  });

  it("rejeita transição draft → completed", async () => {
    const { app, cookie } = await login();
    const client = await createClient(app, cookie);
    const created = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ name: "Draft", clientId: client.id, ownerUserId: "seed-user" }),
    });
    const project = (await created.json()) as { id: string };
    const invalid = await app.request(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "completed" }),
    });
    expect(invalid.status).toBe(409);
    await expect(invalid.json()).resolves.toEqual({ error: "Transição inválida" });
  });

  it("marca active com prazo passado como overdue", async () => {
    const { app, cookie } = await login(
      createTestDeps({ now: () => new Date("2026-08-18T12:00:00.000Z") }),
    );
    const client = await createClient(app, cookie);
    const created = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Atrasado",
        clientId: client.id,
        ownerUserId: "seed-user",
        dueDate: "2026-08-01",
      }),
    });
    const project = (await created.json()) as { id: string; visualState: string | null };
    expect(project.visualState).toBeNull();
    const activated = await app.request(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "active" }),
    });
    expect(activated.status).toBe(200);
    await expect(activated.json()).resolves.toMatchObject({ visualState: "overdue" });
  });

  it("GET de projeto de outro workspace retorna 404 vazio", async () => {
    const a = await login();
    const client = await createClient(a.app, a.cookie);
    const created = await a.app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: a.cookie },
      body: JSON.stringify({ name: "Privado", clientId: client.id, ownerUserId: "seed-user" }),
    });
    const project = (await created.json()) as { id: string };
    const loginB = await a.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner-b@example.com", password: "changeme" }),
    });
    const cookieB = cookieFrom(loginB);
    const response = await a.app.request(`/api/projects/${project.id}`, {
      headers: { cookie: cookieB },
    });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
