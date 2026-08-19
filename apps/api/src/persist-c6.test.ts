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
  await prisma.client.deleteMany({ where: { workspaceId: { in: workspaceIds } } }).catch(() => undefined);
  await prisma.member.deleteMany({ where: { user: { email: { in: emails } } } });
  for (const id of workspaceIds) {
    await prisma.workspace.delete({ where: { id } }).catch(() => undefined);
  }
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
}

describe.skipIf(!databaseUrl)("C6 persistência aprovações", () => {
  it("grava snapshot, isola tenant e revoga sem apagar", async () => {
    const prisma = new PrismaClient();
    const emailA = `c6-a-${Date.now()}@example.com`;
    const emailB = `c6-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner A C6",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C6" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner B C6",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C6" } } },
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
        body: JSON.stringify({ name: "Cliente C6", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };
      const projectRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ name: "Proj C6", clientId: client.id, ownerUserId: userA.id }),
      });
      const project = (await projectRes.json()) as {
        id: string;
        clientId: string;
        stages: Array<{ key: string; status: string }>;
      };
      expect(project.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

      const created = await app.request("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ projectId: project.id, kind: "staging", approverId: "ignored" }),
      });
      expect(created.status).toBe(201);
      const pending = (await created.json()) as {
        id: string;
        status: string;
        projectSnapshot: { currentStageKey: string | null; projectId: string };
      };
      expect(pending.status).toBe("pending");
      expect(pending.projectSnapshot.currentStageKey).toBe("briefing");

      const illegal = await app.request(`/api/approvals/${pending.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ action: "revoke" }),
      });
      expect(illegal.status).toBe(409);

      const granted = await app.request(`/api/approvals/${pending.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ action: "grant", approverId: "forged" }),
      });
      expect(granted.status).toBe(200);
      const grantedDto = (await granted.json()) as {
        id: string;
        status: string;
        approverId: string;
        decidedAt: string;
      };
      expect(grantedDto.status).toBe("granted");
      expect(grantedDto.approverId).toBe(userA.id);

      const revoked = await app.request(`/api/approvals/${pending.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ action: "revoke" }),
      });
      expect(revoked.status).toBe(200);
      await expect(revoked.json()).resolves.toMatchObject({
        id: pending.id,
        status: "revoked",
        decidedAt: grantedDto.decidedAt,
      });

      const ficha = await app.request(`/api/projects/${project.id}`, { headers: { cookie: cookieA } });
      const after = (await ficha.json()) as { stages: Array<{ key: string; status: string }> };
      expect(after.stages.find((stage) => stage.key === "briefing")?.status).toBe("in_progress");

      const idor = await app.request(`/api/approvals/${pending.id}`, { headers: { cookie: cookieB } });
      expect(idor.status).toBe(404);
      expect(await idor.text()).toBe("");

      const listB = await app.request("/api/approvals", { headers: { cookie: cookieB } });
      expect(listB.status).toBe(200);
      await expect(listB.json()).resolves.toEqual([]);
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
