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
  await prisma.reminder.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.blocker.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.approval.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.validation.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
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

describe.skipIf(!databaseUrl)("C7 persistência blockers", () => {
  it("grava blocker, rejeita complete, resolve sem avançar e isola tenant", async () => {
    const prisma = new PrismaClient();
    const emailA = `c7-a-${Date.now()}@example.com`;
    const emailB = `c7-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner A C7",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C7" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner B C7",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C7" } } },
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
      const loginB = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailB, password }),
      });
      const cookieB = cookieFrom(loginB);

      const clientRes = await app.request("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ name: "Cliente C7", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };
      const projectRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ name: "Proj C7", clientId: client.id, ownerUserId: userA.id, workflowTemplateId: await workflowTemplateIdOf(app, cookieA) }),
      });
      const project = (await projectRes.json()) as {
        id: string;
        currentStageKey: string | null;
        stages: Array<{ id: string; key: string; status: string }>;
      };
      const briefing = project.stages.find((stage) => stage.key === "briefing");
      expect(briefing?.status).toBe("in_progress");
      if (!briefing) return;

      const created = await app.request("/api/blockers", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          projectId: project.id,
          title: "API key Stripe",
          assigneeKind: "internal",
          assigneeUserId: userA.id,
          blocksStageId: briefing.id,
          workspaceId: "forjado",
        }),
      });
      expect(created.status).toBe(201);
      const pending = (await created.json()) as { id: string; status: string };
      expect(pending.status).toBe("open");

      const blockedComplete = await app.request(
        `/api/projects/${project.id}/stages/${briefing.id}/transition`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: cookieA },
          body: JSON.stringify({ action: "complete", to: "proposal" }),
        },
      );
      expect(blockedComplete.status).toBe(409);

      const resolved = await app.request(`/api/blockers/${pending.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ action: "resolve" }),
      });
      expect(resolved.status).toBe(200);

      const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie: cookieA } });
      const after = (await ficha.json()) as {
        currentStageKey: string | null;
        stages: Array<{ key: string; status: string }>;
      };
      expect(after.currentStageKey).toBe("briefing");
      expect(after.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

      const idor = await app.request(`/api/blockers/${pending.id}`, { headers: { cookie: cookieB } });
      expect(idor.status).toBe(404);
      expect(await idor.text()).toBe("");

      const listB = await app.request("/api/blockers", { headers: { cookie: cookieB } });
      expect(listB.status).toBe(200);
      await expect(listB.json()).resolves.toEqual([]);
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
