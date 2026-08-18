import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createPrismaAuthenticate, createPrismaWorkspaceLookup } from "./prisma-auth";

loadDotenv({ path: resolve(process.cwd(), "../../.env") });
loadDotenv({ path: resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("persistência postgres", () => {
  it("autentica o owner persistido no workspace da sessão", async () => {
    const prisma = new PrismaClient();
    const email = `persist-${Date.now()}@example.com`;
    const password = "changeme";
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
      });

      const login = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      expect(login.status).toBe(200);
      const cookie =
        login.headers.getSetCookie?.()[0]?.split(";")[0] ??
        (login.headers.get("set-cookie") ?? "").split(";")[0] ??
        "";

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
});
