import type { Prisma, PrismaClient } from "@prisma/client";
import type { ActivityAction, ClientStatus, EntityType, ProjectPriority, ProjectStatus } from "../domain/types.js";
import type {
  ActivityRecord,
  ClientCreateInput,
  ClientFilters,
  ClientRecord,
  NotesStore,
  ProjectCreateInput,
  ProjectFilters,
  ProjectRecord,
} from "./types.js";

function mapClient(row: {
  id: string;
  workspaceId: string;
  name: string;
  company: string | null;
  whatsapp: string | null;
  email: string | null;
  ownerUserId: string;
  notes: string | null;
  status: ClientStatus;
  lastContactAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ClientRecord {
  return { ...row };
}

function mapProject(row: {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  description: string | null;
  ownerUserId: string;
  status: ProjectStatus;
  startDate: Date | null;
  dueDate: Date | null;
  priority: ProjectPriority;
  progress: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectRecord {
  return { ...row };
}

export function createPrismaStore(prisma: PrismaClient): NotesStore {
  return {
    async listMembers(workspaceId) {
      const members = await prisma.member.findMany({
        where: { workspaceId },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return members.map((member) => ({
        userId: member.userId,
        workspaceId: member.workspaceId,
        name: member.user.name,
        email: member.user.email,
      }));
    },
    async memberExists(workspaceId, userId) {
      const member = await prisma.member.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
      });
      return Boolean(member);
    },
    async listClients(workspaceId, filters: ClientFilters) {
      const rows = await prisma.client.findMany({
        where: {
          workspaceId,
          ...(filters.ownerUserId ? { ownerUserId: filters.ownerUserId } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.name
            ? { name: { contains: filters.name, mode: "insensitive" } }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapClient);
    },
    async getClient(id) {
      const row = await prisma.client.findUnique({ where: { id } });
      return row ? mapClient(row) : null;
    },
    async createClient(data: ClientCreateInput) {
      const row = await prisma.client.create({ data });
      return mapClient(row);
    },
    async updateClient(id, data) {
      try {
        const row = await prisma.client.update({ where: { id }, data });
        return mapClient(row);
      } catch {
        return null;
      }
    },
    async countProjectsForClient(clientId) {
      return prisma.project.count({ where: { clientId } });
    },
    async deleteClient(id) {
      try {
        await prisma.client.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async listProjects(workspaceId, filters: ProjectFilters) {
      const rows = await prisma.project.findMany({
        where: {
          workspaceId,
          ...(filters.ownerUserId ? { ownerUserId: filters.ownerUserId } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.clientId ? { clientId: filters.clientId } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.dueBefore || filters.dueAfter
            ? {
                dueDate: {
                  ...(filters.dueAfter ? { gte: filters.dueAfter } : {}),
                  ...(filters.dueBefore ? { lte: filters.dueBefore } : {}),
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapProject);
    },
    async getProject(id) {
      const row = await prisma.project.findUnique({ where: { id } });
      return row ? mapProject(row) : null;
    },
    async createProject(data: ProjectCreateInput) {
      const row = await prisma.project.create({ data });
      return mapProject(row);
    },
    async updateProject(id, data) {
      try {
        const row = await prisma.project.update({ where: { id }, data });
        return mapProject(row);
      } catch {
        return null;
      }
    },
    async deleteProject(id) {
      try {
        await prisma.project.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async appendActivity(data) {
      const row = await prisma.activityEvent.create({
        data: {
          workspaceId: data.workspaceId,
          actorId: data.actorId,
          entityType: data.entityType,
          entityId: data.entityId,
          action: data.action,
          payload: data.payload as Prisma.InputJsonValue,
        },
      });
      return mapActivity(row);
    },
    async listActivity(workspaceId, entityType, entityId) {
      const rows = await prisma.activityEvent.findMany({
        where: { workspaceId, entityType, entityId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapActivity);
    },
    async listClientHistory(workspaceId, clientId) {
      const projectIds = (
        await prisma.project.findMany({
          where: { workspaceId, clientId },
          select: { id: true },
        })
      ).map((row) => row.id);
      const rows = await prisma.activityEvent.findMany({
        where: {
          workspaceId,
          OR: [
            { entityType: "client", entityId: clientId },
            ...(projectIds.length > 0
              ? [{ entityType: "project", entityId: { in: projectIds } }]
              : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapActivity);
    },
  };
}

function mapActivity(row: {
  id: string;
  workspaceId: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: Prisma.JsonValue;
  createdAt: Date;
}): ActivityRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    actorId: row.actorId,
    entityType: row.entityType as EntityType,
    entityId: row.entityId,
    action: row.action as ActivityAction,
    payload: jsonObject(row.payload),
    createdAt: row.createdAt,
  };
}

function jsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}
