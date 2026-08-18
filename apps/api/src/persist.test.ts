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

describe.skipIf(!databaseUrl)("persistência postgres", () => {
  it("autentica o owner persistido no workspace da sessão", async () => {
    const prisma = new PrismaClient();
    const email = `persist-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: {
              role: "owner",
              workspace: { create: { name: "Persist" } },
            },
          },
        },
        include: { memberships: true },
      });
      const workspaceId = user.memberships[0]?.workspaceId;
      expect(workspaceId).toBeTruthy();

      const app = createApp({
        authSecret: "a".repeat(32),
        webOrigin: "http://localhost:3015",
        authenticate: createPrismaAuthenticate(prisma),
        getWorkspace: createPrismaWorkspaceLookup(prisma),
        getSessionVersion: sessionVersion.getSessionVersion,
        bumpSessionVersion: sessionVersion.bumpSessionVersion,
      });

      const login = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      expect(login.status).toBe(200);
      const cookie = cookieFrom(login);

      const me = await app.request("/api/me", { headers: { cookie } });
      expect(me.status).toBe(200);
      await expect(me.json()).resolves.toMatchObject({
        email,
        role: "owner",
        workspaceId,
      });
    } finally {
      const membership = await prisma.member.findFirst({ where: { user: { email } } });
      if (membership) {
        await prisma.workspace.delete({ where: { id: membership.workspaceId } }).catch(() => undefined);
      }
      await prisma.user.deleteMany({ where: { email } });
      await prisma.$disconnect();
    }
  });

  it("logout incrementa sessionVersion e o JWT antigo recebe 401", async () => {
    const prisma = new PrismaClient();
    const email = `persist-logout-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    try {
      await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: {
              role: "owner",
              workspace: { create: { name: "Logout" } },
            },
          },
        },
      });

      const app = createApp({
        authSecret: "a".repeat(32),
        webOrigin: "http://localhost:3015",
        authenticate: createPrismaAuthenticate(prisma),
        getWorkspace: createPrismaWorkspaceLookup(prisma),
        getSessionVersion: sessionVersion.getSessionVersion,
        bumpSessionVersion: sessionVersion.bumpSessionVersion,
      });

      const login = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const cookie = cookieFrom(login);

      const logout = await app.request("/api/auth/logout", {
        method: "POST",
        headers: { cookie },
      });
      expect(logout.status).toBe(200);

      const replay = await app.request("/api/me", { headers: { cookie } });
      expect(replay.status).toBe(401);

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user?.sessionVersion).toBe(1);
    } finally {
      const membership = await prisma.member.findFirst({ where: { user: { email } } });
      if (membership) {
        await prisma.workspace.delete({ where: { id: membership.workspaceId } }).catch(() => undefined);
      }
      await prisma.user.deleteMany({ where: { email } });
      await prisma.$disconnect();
    }
  });

  it("GET /api/workspace/:id de outro tenant retorna 404 vazio", async () => {
    const prisma = new PrismaClient();
    const emailA = `persist-a-${Date.now()}@example.com`;
    const emailB = `persist-b-${Date.now()}@example.com`;
    const password = "changeme";
    const sessionVersion = createPrismaSessionVersion(prisma);
    let workspaceA: string | undefined;
    let workspaceB: string | undefined;
    try {
      const userA = await prisma.user.create({
        data: {
          email: emailA,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: {
              role: "owner",
              workspace: { create: { name: "Tenant A" } },
            },
          },
        },
        include: { memberships: true },
      });
      const userB = await prisma.user.create({
        data: {
          email: emailB,
          passwordHash: await bcrypt.hash(password, 4),
          memberships: {
            create: {
              role: "owner",
              workspace: { create: { name: "Tenant B" } },
            },
          },
        },
        include: { memberships: true },
      });
      workspaceA = userA.memberships[0]?.workspaceId;
      workspaceB = userB.memberships[0]?.workspaceId;
      expect(workspaceA && workspaceB).toBeTruthy();

      const app = createApp({
        authSecret: "a".repeat(32),
        webOrigin: "http://localhost:3015",
        authenticate: createPrismaAuthenticate(prisma),
        getWorkspace: createPrismaWorkspaceLookup(prisma),
        getSessionVersion: sessionVersion.getSessionVersion,
        bumpSessionVersion: sessionVersion.bumpSessionVersion,
      });

      const login = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailA, password }),
      });
      const cookie = cookieFrom(login);

      const own = await app.request(`/api/workspace/${workspaceA}`, { headers: { cookie } });
      expect(own.status).toBe(200);
      await expect(own.json()).resolves.toMatchObject({ id: workspaceA, name: "Tenant A" });

      const other = await app.request(`/api/workspace/${workspaceB}`, { headers: { cookie } });
      expect(other.status).toBe(404);
      expect(await other.text()).toBe("");
    } finally {
      await prisma.member.deleteMany({ where: { user: { email: { in: [emailA, emailB] } } } });
      if (workspaceA) {
        await prisma.workspace.delete({ where: { id: workspaceA } }).catch(() => undefined);
      }
      if (workspaceB) {
        await prisma.workspace.delete({ where: { id: workspaceB } }).catch(() => undefined);
      }
      await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
      await prisma.$disconnect();
    }
  });
});
