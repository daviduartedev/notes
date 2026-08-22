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
  createPrismaWorkspaceUpdate,
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
  await prisma.meeting.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
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

describe.skipIf(!databaseUrl)("C8 persistência reminders", () => {
  it("avalia política com relógio fake, isola tenant e completa", async () => {
    const prisma = new PrismaClient();
    const emailA = `c8-a-${Date.now()}@example.com`;
    const emailB = `c8-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    let now = new Date("2026-04-01T12:00:00.000Z");
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner A C8",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C8" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner B C8",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C8" } } },
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
        updateWorkspace: createPrismaWorkspaceUpdate(prisma),
        getSessionVersion: sessionVersion.getSessionVersion,
        bumpSessionVersion: sessionVersion.bumpSessionVersion,
        store,
        now: () => new Date(now),
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
        body: JSON.stringify({ name: "Cliente C8", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };
      const projectRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ name: "Proj C8", clientId: client.id, ownerUserId: userA.id, workflowTemplateId: await workflowTemplateIdOf(app, cookieA) }),
      });
      const project = (await projectRes.json()) as {
        id: string;
        stages: Array<{
          id: string;
          key: string;
          isCurrent: boolean;
          actions: Array<{ action: string; enabled: boolean; toKey: string | null }>;
        }>;
      };

      for (let step = 0; step < 12; step += 1) {
        const ficha = await app.request(`/api/projects/${project.id}`, {
          headers: { cookie: cookieA },
        });
        const detail = (await ficha.json()) as {
          currentStageKey: string | null;
          stages: typeof project.stages;
        };
        if (detail.currentStageKey === "waiting_client") break;
        const current = detail.stages.find((stage) => stage.isCurrent);
        const complete = current?.actions.find((item) => item.action === "complete" && item.enabled);
        expect(current && complete).toBeTruthy();
        if (!current || !complete) break;
        await app.request(`/api/projects/${project.id}/stages/${current.id}/transition`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: cookieA },
          body: JSON.stringify({ action: "complete", to: complete.toKey }),
        });
      }

      const early = await app.request("/api/reminders", { headers: { cookie: cookieA } });
      expect(early.status).toBe(200);
      await expect(early.json()).resolves.toEqual([]);

      now = new Date("2026-04-04T12:00:00.000Z");
      const listed = await app.request("/api/reminders", { headers: { cookie: cookieA } });
      expect(listed.status).toBe(200);
      const rows = (await listed.json()) as Array<{ id: string; status: string; channel: string }>;
      expect(rows).toHaveLength(1);
      expect(rows[0]?.status).toBe("due");
      expect(rows[0]?.channel).toBe("internal");

      const listB = await app.request("/api/reminders", { headers: { cookie: cookieB } });
      expect(listB.status).toBe(200);
      await expect(listB.json()).resolves.toEqual([]);

      const idor = await app.request(`/api/reminders/${rows[0]?.id}`, {
        headers: { cookie: cookieB },
      });
      expect(idor.status).toBe(404);
      expect(await idor.text()).toBe("");

      const done = await app.request(`/api/reminders/${rows[0]?.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ action: "complete" }),
      });
      expect(done.status).toBe(200);
      const body = (await done.json()) as { status: string };
      expect(body.status).toBe("done");
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
