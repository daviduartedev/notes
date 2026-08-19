import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { createTestDeps } from "../deps";
import { workflowTemplateIdOf } from "../test/templates";

type WorkflowDto = {
  id: string;
  key: string;
  name: string;
  isDefault: boolean;
  stages: Array<{ key: string; label: string; allowedNextKeys: string[] }>;
};

type ProjectDetail = {
  id: string;
  stages: Array<{ key: string; allowedNextKeys: string[] }>;
};

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

async function createClient(app: ReturnType<typeof createApp>, cookie: string) {
  const response = await app.request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: "Cliente Workflow", ownerUserId: "seed-user" }),
  });
  return (await response.json()) as { id: string };
}

describe("workflow templates", () => {
  it("lista o catálogo seedado e marca SaaS como default", async () => {
    const { app, cookie } = await login("owner@example.com");
    const listed = await app.request("/api/workflow-templates", { headers: { cookie } });
    expect(listed.status).toBe(200);
    const rows = (await listed.json()) as WorkflowDto[];
    expect(rows.map((row) => row.key).sort()).toEqual([
      "app",
      "ecommerce",
      "institutional",
      "landing",
      "maintenance",
      "saas_delivery",
    ]);
    expect(rows.filter((row) => row.isDefault).map((row) => row.key)).toEqual(["saas_delivery"]);
  });

  it("Landing e SaaS geram etapas diferentes na criação do projeto", async () => {
    const { app, cookie } = await login("owner@example.com");
    const client = await createClient(app, cookie);
    const landingId = await workflowTemplateIdOf(app, cookie, "landing");
    const saasId = await workflowTemplateIdOf(app, cookie, "saas_delivery");
    const landingRes = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Landing",
        clientId: client.id,
        ownerUserId: "seed-user",
        workflowTemplateId: landingId,
      }),
    });
    const saasRes = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "SaaS",
        clientId: client.id,
        ownerUserId: "seed-user",
        workflowTemplateId: saasId,
      }),
    });
    expect(landingRes.status).toBe(201);
    expect(saasRes.status).toBe(201);
    const landing = (await landingRes.json()) as ProjectDetail;
    const saas = (await saasRes.json()) as ProjectDetail;
    expect(landing.stages.map((stage) => stage.key)).toEqual([
      "briefing",
      "design",
      "development",
      "publication",
    ]);
    expect(saas.stages.map((stage) => stage.key)).toHaveLength(10);
    expect(landing.stages.map((stage) => stage.key)).not.toEqual(saas.stages.map((stage) => stage.key));
  });

  it("editar o molde não altera instâncias já copiadas", async () => {
    const { app, cookie } = await login("owner@example.com");
    const client = await createClient(app, cookie);
    const landingId = await workflowTemplateIdOf(app, cookie, "landing");
    const created = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Instância",
        clientId: client.id,
        ownerUserId: "seed-user",
        workflowTemplateId: landingId,
      }),
    });
    const project = (await created.json()) as ProjectDetail & { id: string };
    const patch = await app.request(`/api/workflow-templates/${landingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        stages: [
          {
            key: "briefing",
            label: "Briefing",
            phase: "commercial",
            order: 1,
            allowedNextKeys: ["publication"],
            entryCriteria: "x",
            exitCriteria: "y",
          },
          {
            key: "publication",
            label: "Publicação",
            phase: "development",
            order: 2,
          },
        ],
      }),
    });
    expect(patch.status).toBe(200);
    const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie } });
    const detail = (await ficha.json()) as ProjectDetail;
    expect(detail.stages.find((stage) => stage.key === "briefing")?.allowedNextKeys).toEqual(["design"]);
    expect(detail.stages).toHaveLength(4);
  });

  it("create sem template devolve 400 e template de outro workspace 404", async () => {
    const { app, cookie } = await login("owner@example.com");
    const client = await createClient(app, cookie);
    const missing = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Sem molde",
        clientId: client.id,
        ownerUserId: "seed-user",
      }),
    });
    expect(missing.status).toBe(400);
    const other = await login("owner-b@example.com");
    const foreignId = await workflowTemplateIdOf(other.app, other.cookie, "landing");
    const cross = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        name: "Cruzado",
        clientId: client.id,
        ownerUserId: "seed-user",
        workflowTemplateId: foreignId,
      }),
    });
    expect(cross.status).toBe(404);
    expect(await cross.text()).toBe("");
  });

  it("member lista e cria projeto, mas não muta o molde", async () => {
    const owner = await login("owner@example.com");
    const landingId = await workflowTemplateIdOf(owner.app, owner.cookie, "landing");
    const member = await login("member@example.com", owner.deps);
    const listed = await member.app.request("/api/workflow-templates", { headers: { cookie: member.cookie } });
    expect(listed.status).toBe(200);
    const create = await member.app.request("/api/workflow-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: member.cookie },
      body: JSON.stringify({
        key: "custom_flow",
        name: "Custom",
        stages: [{ key: "one", label: "Uma", phase: "development", order: 1 }],
      }),
    });
    expect(create.status).toBe(403);
    const patch = await member.app.request(`/api/workflow-templates/${landingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: member.cookie },
      body: JSON.stringify({ name: "Hack" }),
    });
    expect(patch.status).toBe(403);
    const remove = await member.app.request(`/api/workflow-templates/${landingId}`, {
      method: "DELETE",
      headers: { cookie: member.cookie },
    });
    expect(remove.status).toBe(403);
  });

  it("workspace B não vê templates do A", async () => {
    const a = await login("owner@example.com");
    const listedA = await a.app.request("/api/workflow-templates", { headers: { cookie: a.cookie } });
    const templatesA = (await listedA.json()) as WorkflowDto[];
    const idA = templatesA[0]?.id;
    expect(idA).toBeTruthy();
    const b = await login("owner-b@example.com");
    const listedB = await b.app.request("/api/workflow-templates", { headers: { cookie: b.cookie } });
    const templatesB = (await listedB.json()) as WorkflowDto[];
    expect(templatesB.some((row) => row.id === idA)).toBe(false);
    const get = await b.app.request(`/api/workflow-templates/${idA}`, { headers: { cookie: b.cookie } });
    expect(get.status).toBe(404);
    expect(await get.text()).toBe("");
  });

  it("owner cria template custom e não apaga catálogo", async () => {
    const { app, cookie } = await login("owner@example.com");
    const created = await app.request("/api/workflow-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        key: "custom_flow",
        name: "Fluxo extra",
        stages: [
          { key: "start", label: "Início", phase: "commercial", order: 1 },
          { key: "end", label: "Fim", phase: "development", order: 2 },
        ],
      }),
    });
    expect(created.status).toBe(201);
    const row = (await created.json()) as WorkflowDto;
    expect(row.stages.map((stage) => stage.key)).toEqual(["start", "end"]);
    const landingId = await workflowTemplateIdOf(app, cookie, "landing");
    const forbidden = await app.request(`/api/workflow-templates/${landingId}`, {
      method: "DELETE",
      headers: { cookie },
    });
    expect(forbidden.status).toBe(409);
    const removed = await app.request(`/api/workflow-templates/${row.id}`, {
      method: "DELETE",
      headers: { cookie },
    });
    expect(removed.status).toBe(204);
  });
});
