import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import type { PipelineBoardDto } from "./domain/pipeline-board";
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

function idsIn(board: PipelineBoardDto, key: string): string[] {
  return (board.columns.find((column) => column.key === key)?.projects ?? []).map((project) => project.id);
}

describe.skipIf(!databaseUrl)("C3 persistência pipeline", () => {
  it("agrupa por etapa e isola workspace B", async () => {
    const prisma = new PrismaClient();
    const emailA = `c3-a-${Date.now()}@example.com`;
    const emailB = `c3-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner A C3",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C3" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner B C3",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C3" } } },
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
        now: () => new Date(),
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
        body: JSON.stringify({ name: "Cliente C3", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };

      const firstRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Briefing C3",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: await workflowTemplateIdOf(app, cookieA),
        }),
      });
      const first = (await firstRes.json()) as {
        id: string;
        stages: Array<{ id: string; key: string; isCurrent: boolean }>;
      };
      const secondRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Proposal C3",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: await workflowTemplateIdOf(app, cookieA),
        }),
      });
      const second = (await secondRes.json()) as {
        id: string;
        stages: Array<{ id: string; key: string }>;
      };
      const briefing = second.stages.find((stage) => stage.key === "briefing");
      expect(briefing).toBeDefined();
      if (!briefing) return;
      const moved = await app.request(`/api/projects/${second.id}/stages/${briefing.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ to: "proposal" }),
      });
      expect(moved.status).toBe(200);

      const boardRes = await app.request("/api/pipeline", { headers: { cookie: cookieA } });
      expect(boardRes.status).toBe(200);
      const board = (await boardRes.json()) as PipelineBoardDto;
      expect(idsIn(board, "briefing")).toEqual([first.id]);
      expect(idsIn(board, "proposal")).toEqual([second.id]);

      const loginB = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailB, password }),
      });
      const cookieB = cookieFrom(loginB);
      const isolated = await app.request("/api/pipeline", { headers: { cookie: cookieB } });
      const empty = (await isolated.json()) as PipelineBoardDto;
      expect(empty.columns.flatMap((column) => column.projects)).toEqual([]);
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
