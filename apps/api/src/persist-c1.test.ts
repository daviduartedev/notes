import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import {
  createPrismaAuthenticate,
  createPrismaSessionVersion,
  createPrismaWorkspaceLookup,
} from "./prisma-auth";
import { createPrismaStore } from "./store/prisma";
import { workflowTemplateIdOf } from "./test/templates";

loadDotenv({ path: resolve(process.cwd(), "../../.env") });
loadDotenv({ path: resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;

function cookieFrom(response: Response): string {
  return (
    response.headers.getSetCookie?.()[0]?.split(";")[0] ??
    (response.headers.get("set-cookie") ?? "").split(";")[0] ??
    ""
  );
}

async function cleanup(prisma: PrismaClient, emails: string[], workspaceIds: string[]) {
  await prisma.activityEvent.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.projectChecklist.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.checklistTemplate.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.project.updateMany({
    where: { workspaceId: { in: workspaceIds } },
    data: { currentStageId: null, workflowTemplateId: null },
  }).catch(() => undefined);
  await prisma.stage.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.project.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.workflowTemplate.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.client.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.member.deleteMany({ where: { user: { email: { in: emails } } } });
  for (const id of workspaceIds) {
    await prisma.workspace.delete({ where: { id } }).catch(() => undefined);
  }
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
}

describe.skipIf(!databaseUrl)("C1 persistência clientes/projetos", () => {
  it("cria dois projetos, histórico project.created x2, IDOR 404, transição inválida e overdue", async () => {
    const prisma = new PrismaClient();
    const emailA = `c1-a-${Date.now()}@example.com`;
    const emailB = `c1-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C1" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C1" } } },
          },
        },
        include: { memberships: true },
      });
      const workspaceA = userA.memberships[0]?.workspaceId;
      const workspaceB = userB.memberships[0]?.workspaceId;
      expect(workspaceA && workspaceB).toBeTruthy();
      if (workspaceA) workspaceIds.push(workspaceA);
      if (workspaceB) workspaceIds.push(workspaceB);

      const frozenNow = new Date("2026-08-18T12:00:00.000Z");
      const app = createApp({
        authSecret: "a".repeat(32),
        webOrigin: "http://localhost:3015",
        authenticate: createPrismaAuthenticate(prisma),
        getWorkspace: createPrismaWorkspaceLookup(prisma),
        getSessionVersion: sessionVersion.getSessionVersion,
        bumpSessionVersion: sessionVersion.bumpSessionVersion,
        store: createPrismaStore(prisma),
        now: () => frozenNow,
      });

      const loginA = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailA, password }),
      });
      const cookieA = cookieFrom(loginA);

      const clientRes = await app.request("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Cliente Persist",
          ownerUserId: userA.id,
          workspaceId: workspaceB,
        }),
      });
      expect(clientRes.status).toBe(201);
      const client = (await clientRes.json()) as { id: string; workspaceId: string };
      expect(client.workspaceId).toBe(workspaceA);

      const p1 = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Projeto 1",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: await workflowTemplateIdOf(app, cookieA),
          dueDate: "2026-08-01",
        }),
      });
      const p2 = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Projeto 2",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: await workflowTemplateIdOf(app, cookieA),
        }),
      });
      expect(p1.status).toBe(201);
      expect(p2.status).toBe(201);
      const project1 = (await p1.json()) as { id: string };
      const project2 = (await p2.json()) as { id: string };

      const listed = await app.request(`/api/projects?clientId=${client.id}`, {
        headers: { cookie: cookieA },
      });
      const projects = (await listed.json()) as { id: string }[];
      expect(projects.map((row) => row.id).sort()).toEqual([project1.id, project2.id].sort());

      const history = await app.request(`/api/clients/${client.id}/activity`, {
        headers: { cookie: cookieA },
      });
      const events = (await history.json()) as { action: string; payload: Record<string, unknown> }[];
      expect(events.filter((event) => event.action === "project.created")).toHaveLength(2);
      expect(JSON.stringify(events)).not.toContain(emailA);

      const invalid = await app.request(`/api/projects/${project1.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ status: "completed" }),
      });
      expect(invalid.status).toBe(409);

      const activated = await app.request(`/api/projects/${project1.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ status: "active" }),
      });
      expect(activated.status).toBe(200);
      await expect(activated.json()).resolves.toMatchObject({ visualState: "overdue" });

      const loginB = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailB, password }),
      });
      const cookieB = cookieFrom(loginB);
      const idorProject = await app.request(`/api/projects/${project1.id}`, {
        headers: { cookie: cookieB },
      });
      expect(idorProject.status).toBe(404);
      expect(await idorProject.text()).toBe("");
      const idorClient = await app.request(`/api/clients/${client.id}`, {
        headers: { cookie: cookieB },
      });
      expect(idorClient.status).toBe(404);
      expect(await idorClient.text()).toBe("");
      const idorActivity = await app.request(`/api/clients/${client.id}/activity`, {
        headers: { cookie: cookieB },
      });
      expect(idorActivity.status).toBe(404);
      expect(await idorActivity.text()).toBe("");
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
