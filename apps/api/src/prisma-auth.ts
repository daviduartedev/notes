import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Authenticate } from "./deps.js";

export function createPrismaAuthenticate(prisma: PrismaClient): Authenticate {
  return async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return null;
    }
    const membership = await prisma.member.findFirst({
      where: { userId: user.id },
    });
    return {
      userId: user.id,
      email: user.email,
      workspaceId: membership?.workspaceId ?? null,
      role: membership?.role ?? null,
      sessionVersion: user.sessionVersion,
    };
  };
}

export function createPrismaWorkspaceLookup(prisma: PrismaClient) {
  return async (workspaceId: string) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });
    return workspace;
  };
}

export function createPrismaSessionVersion(prisma: PrismaClient) {
  return {
    getSessionVersion: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { sessionVersion: true },
      });
      return user?.sessionVersion ?? null;
    },
    bumpSessionVersion: async (userId: string) => {
      await prisma.user.updateMany({
        where: { id: userId },
        data: { sessionVersion: { increment: 1 } },
      });
    },
  };
}
