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
  await prisma.project
    .updateMany({
      where: { workspaceId: { in: workspaceIds } },
      data: { currentStageId: null, workflowTemplateId: null },
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

describe.skipIf(!databaseUrl)("C11 persistência templates", () => {
  it("Landing ≠ SaaS, molde mutado não reescreve instância e isola tenant B", async () => {
    const prisma = new PrismaClient();
    const emailA = `c11-a-${Date.now()}@example.com`;
    const emailB = `c11-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    const workspaceIds: string[] = [];
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner A C11",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant A C11" } } },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          name: "Owner B C11",
          memberships: {
            create: { role: "owner", workspace: { create: { name: "Tenant B C11" } } },
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
      const loginB = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailB, password }),
      });
      const cookieB = cookieFrom(loginB);

      const clientRes = await app.request("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ name: "Cliente C11", ownerUserId: userA.id }),
      });
      const client = (await clientRes.json()) as { id: string };
      const landingId = await workflowTemplateIdOf(app, cookieA, "landing");
      const saasId = await workflowTemplateIdOf(app, cookieA, "saas_delivery");

      const landingRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "Landing C11",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: landingId,
        }),
      });
      const saasRes = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          name: "SaaS C11",
          clientId: client.id,
          ownerUserId: userA.id,
          workflowTemplateId: saasId,
        }),
      });
      expect(landingRes.status).toBe(201);
      expect(saasRes.status).toBe(201);
      const landing = (await landingRes.json()) as {
        id: string;
        stages: Array<{ key: string; allowedNextKeys: string[] }>;
      };
      const saas = (await saasRes.json()) as { stages: Array<{ key: string }> };
      expect(landing.stages.map((stage) => stage.key)).toEqual([
        "briefing",
        "design",
        "development",
        "publication",
      ]);
      expect(saas.stages).toHaveLength(10);

      await store.updateStageTemplateAllowedNextKeys(landingId, "briefing", ["publication"]);
      const again = await app.request(`/api/projects/${landing.id}`, { headers: { cookie: cookieA } });
      const unchanged = (await again.json()) as {
        stages: Array<{ key: string; allowedNextKeys: string[] }>;
      };
      expect(unchanged.stages.find((stage) => stage.key === "briefing")?.allowedNextKeys).toEqual(["design"]);

      const listedB = await app.request("/api/workflow-templates", { headers: { cookie: cookieB } });
      const templatesB = (await listedB.json()) as { id: string }[];
      expect(templatesB.some((row) => row.id === landingId)).toBe(false);
      const idor = await app.request(`/api/workflow-templates/${landingId}`, { headers: { cookie: cookieB } });
      expect(idor.status).toBe(404);
    } finally {
      await cleanup(prisma, [emailA, emailB], workspaceIds);
      await prisma.$disconnect();
    }
  });
});
