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

describe.skipIf(!databaseUrl)("C2 persistência etapas", () => {
  it("copia etapas, rejeita pulo ilegal sem event, isola template e IDOR", async () => {
    const prisma = new PrismaClient();
    const emailA = `c2-a-${Date.now()}@example.com`;
    const emailB = `c2-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C2" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C2" } } },
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
        body: JSON.stringify({ name: "Cliente C2", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };

      const created = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Projeto C2",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: await workflowTemplateIdOf(app, cookieA),
        }),
      });
      expect(created.status).toBe(201);
      const project = (await created.json()) as {
        id: string;
        workflowTemplateId: string;
        currentStageKey: string;
        stages: Array<{ id: string; key: string; allowedNextKeys: string[] }>;
      };
      expect(project.stages).toHaveLength(10);
      expect(project.currentStageKey).toBe("briefing");

      const briefing = project.stages.find((stage) => stage.key === "briefing");
      expect(briefing).toBeDefined();
      if (!briefing) return;

      const illegal = await app.request(`/api/projects/${project.id}/stages/${briefing.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ action: "complete", to: "kickoff" }),
      });
      expect(illegal.status).toBe(409);

      const historyAfterIllegal = await app.request(`/api/projects/${project.id}/activity`, {
        headers: { cookie: cookieA },
      });
      const events = (await historyAfterIllegal.json()) as { action: string }[];
      expect(events.filter((event) => event.action === "stage.transitioned")).toHaveLength(0);

      const valid = await app.request(`/api/projects/${project.id}/stages/${briefing.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ to: "proposal" }),
      });
      expect(valid.status).toBe(200);
      const moved = (await valid.json()) as { currentStageKey: string };
      expect(moved.currentStageKey).toBe("proposal");

      const history = await app.request(`/api/projects/${project.id}/activity`, {
        headers: { cookie: cookieA },
      });
      const afterValid = (await history.json()) as { action: string; payload: Record<string, unknown> }[];
      expect(afterValid.some((event) => event.action === "stage.transitioned" && event.payload.from === "briefing" && event.payload.to === "proposal")).toBe(true);

      await store.updateStageTemplateAllowedNextKeys(project.workflowTemplateId, "briefing", ["production"]);
      const again = await app.request(`/api/projects/${project.id}`, { headers: { cookie: cookieA } });
      const unchanged = (await again.json()) as {
        stages: Array<{ key: string; allowedNextKeys: string[] }>;
      };
      expect(unchanged.stages.find((stage) => stage.key === "briefing")?.allowedNextKeys).toEqual(["proposal"]);

      const loginB = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailB, password }),
      });
      const cookieB = cookieFrom(loginB);
      const idor = await app.request(`/api/projects/${project.id}/stages/${briefing.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieB },
        body: JSON.stringify({ to: "proposal" }),
      });
      expect(idor.status).toBe(404);
      expect(await idor.text()).toBe("");
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
