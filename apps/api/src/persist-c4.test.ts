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
  await prisma.project
    .updateMany({
      where: { workspaceId: { in: workspaceIds } },
      data: { currentStageId: null },
    })
    .catch(() => undefined);
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

describe.skipIf(!databaseUrl)("C4 persistência checklists", () => {
  it("copia itens, isola template e IDOR", async () => {
    const prisma = new PrismaClient();
    const emailA = `c4-a-${Date.now()}@example.com`;
    const emailB = `c4-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner A C4",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C4" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner B C4",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C4" } } },
          },
        },
        include: { memberships: true },
      });
      const workspaceA = userA.memberships[0]?.workspaceId;
      const workspaceB = userB.memberships[0]?.workspaceId;
      expect(workspaceA && workspaceB).toBeTruthy();
      if (workspaceA) workspaceIds.push(workspaceA);
      if (workspaceB) workspaceIds.push(workspaceB);

      const store = createPrismaStore(prisma);
      const app = createApp({
        authSecret: "a".repeat(32),
        webOrigin: "http://localhost:3015",
        authenticate: createPrismaAuthenticate(prisma),
        getWorkspace: createPrismaWorkspaceLookup(prisma),
        getSessionVersion: sessionVersion.getSessionVersion,
        bumpSessionVersion: sessionVersion.bumpSessionVersion,
        store,
        now: () => new Date("2026-08-19T16:00:00.000Z"),
      });

      const loginA = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailA, password }),
      });
      const cookieA = cookieFrom(loginA);

      const templatesRes = await app.request("/api/checklist-templates", { headers: { cookie: cookieA } });
      const templates = (await templatesRes.json()) as Array<{
        id: string;
        items: Array<{ id: string; title: string }>;
      }>;
      const template = templates[0];
      expect(template?.items).toHaveLength(8);
      if (!template) return;

      const clientRes = await app.request("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ name: "Cliente C4", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };

      async function createNamed(name: string) {
        const created = await app.request("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: cookieA },
          body: JSON.stringify({ name, clientId: client.id, ownerUserId: userA.id, workflowTemplateId: await workflowTemplateIdOf(app, cookieA) }),
        });
        return (await created.json()) as { id: string; stages: Array<{ status: string; key: string }> };
      }

      const projectA = await createNamed("Proj C4 A");
      const projectB = await createNamed("Proj C4 B");

      const applyA = await app.request(`/api/projects/${projectA.id}/checklists/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ templateId: template.id }),
      });
      const applyB = await app.request(`/api/projects/${projectB.id}/checklists/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ templateId: template.id }),
      });
      expect(applyA.status).toBe(201);
      expect(applyB.status).toBe(201);
      const instanceA = (await applyA.json()) as {
        items: Array<{ id: string; title: string; completedAt: string | null }>;
      };

      await app.request(`/api/checklist-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          items: [{ id: template.items[0]?.id, title: "Environment ALTERADO" }],
        }),
      });
      const listed = await app.request(`/api/projects/${projectA.id}/checklists`, { headers: { cookie: cookieA } });
      const still = ((await listed.json()) as Array<{ items: Array<{ title: string }> }>)[0];
      expect(still?.items[0]?.title).toBe("Environment");

      const complete = await app.request(`/api/checklist-items/${instanceA.items[0]?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ completed: true, note: "feito" }),
      });
      expect(complete.status).toBe(200);
      const item = (await complete.json()) as { completedByUserId: string; completedAt: string | null };
      expect(item.completedByUserId).toBe(userA.id);
      expect(item.completedAt).toBeTruthy();

      const ficha = await app.request(`/api/projects/${projectA.id}`, { headers: { cookie: cookieA } });
      const after = (await ficha.json()) as { stages: Array<{ key: string; status: string }> };
      expect(after.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

      const loginB = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailB, password }),
      });
      const cookieB = cookieFrom(loginB);
      const idor = await app.request(`/api/checklist-items/${instanceA.items[0]?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieB },
        body: JSON.stringify({ completed: false }),
      });
      expect(idor.status).toBe(404);
      expect(await idor.text()).toBe("");
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
