import type {
  ActivityCreateInput,
  ActivityRecord,
  ClientCreateInput,
  ClientFilters,
  ClientRecord,
  ClientUpdateInput,
  MemberRecord,
  NotesStore,
  ProjectCreateInput,
  ProjectFilters,
  ProjectRecord,
  ProjectUpdateInput,
} from "./types.js";

function cloneClient(row: ClientRecord): ClientRecord {
  return {
    ...row,
    lastContactAt: row.lastContactAt ? new Date(row.lastContactAt) : null,
    nextFollowUpAt: row.nextFollowUpAt ? new Date(row.nextFollowUpAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function cloneProject(row: ProjectRecord): ProjectRecord {
  return {
    ...row,
    startDate: row.startDate ? new Date(row.startDate) : null,
    dueDate: row.dueDate ? new Date(row.dueDate) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function matchesName(name: string, query: string): boolean {
  return name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"));
}

function matchesProjectFilters(row: ProjectRecord, filters: ProjectFilters): boolean {
  if (filters.ownerUserId && row.ownerUserId !== filters.ownerUserId) return false;
  if (filters.status && row.status !== filters.status) return false;
  if (filters.clientId && row.clientId !== filters.clientId) return false;
  if (filters.priority && row.priority !== filters.priority) return false;
  if (filters.dueBefore && (!row.dueDate || row.dueDate.getTime() > filters.dueBefore.getTime())) {
    return false;
  }
  if (filters.dueAfter && (!row.dueDate || row.dueDate.getTime() < filters.dueAfter.getTime())) {
    return false;
  }
  return true;
}

export function createMemoryStore(seedMembers: MemberRecord[] = []): NotesStore {
  const members = [...seedMembers];
  const clients = new Map<string, ClientRecord>();
  const projects = new Map<string, ProjectRecord>();
  const activities: ActivityRecord[] = [];

  return {
    async listMembers(workspaceId) {
      return members.filter((member) => member.workspaceId === workspaceId);
    },
    async memberExists(workspaceId, userId) {
      return members.some(
        (member) => member.workspaceId === workspaceId && member.userId === userId,
      );
    },
    async listClients(workspaceId, filters: ClientFilters) {
      return [...clients.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => (filters.name ? matchesName(row.name, filters.name) : true))
        .filter((row) => (filters.ownerUserId ? row.ownerUserId === filters.ownerUserId : true))
        .filter((row) => (filters.status ? row.status === filters.status : true))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(cloneClient);
    },
    async getClient(id) {
      const row = clients.get(id);
      return row ? cloneClient(row) : null;
    },
    async createClient(data: ClientCreateInput) {
      const now = new Date();
      const row: ClientRecord = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      clients.set(row.id, row);
      return cloneClient(row);
    },
    async updateClient(id, data: ClientUpdateInput) {
      const current = clients.get(id);
      if (!current) {
        return null;
      }
      const next: ClientRecord = {
        ...current,
        ...data,
        id: current.id,
        workspaceId: current.workspaceId,
        createdAt: current.createdAt,
        updatedAt: new Date(),
      };
      clients.set(id, next);
      return cloneClient(next);
    },
    async countProjectsForClient(clientId) {
      return [...projects.values()].filter((row) => row.clientId === clientId).length;
    },
    async deleteClient(id) {
      return clients.delete(id);
    },
    async listProjects(workspaceId, filters: ProjectFilters) {
      return [...projects.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => matchesProjectFilters(row, filters))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(cloneProject);
    },
    async getProject(id) {
      const row = projects.get(id);
      return row ? cloneProject(row) : null;
    },
    async createProject(data: ProjectCreateInput) {
      const now = new Date();
      const row: ProjectRecord = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      projects.set(row.id, row);
      return cloneProject(row);
    },
    async updateProject(id, data: ProjectUpdateInput) {
      const current = projects.get(id);
      if (!current) {
        return null;
      }
      const next: ProjectRecord = {
        ...current,
        ...data,
        id: current.id,
        workspaceId: current.workspaceId,
        createdAt: current.createdAt,
        updatedAt: new Date(),
      };
      projects.set(id, next);
      return cloneProject(next);
    },
    async deleteProject(id) {
      return projects.delete(id);
    },
    async appendActivity(data: ActivityCreateInput) {
      const row: ActivityRecord = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      activities.push(row);
      return { ...row, payload: { ...row.payload }, createdAt: new Date(row.createdAt) };
    },
    async listActivity(workspaceId, entityType, entityId) {
      return activities
        .filter(
          (row) =>
            row.workspaceId === workspaceId &&
            row.entityType === entityType &&
            row.entityId === entityId,
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row, payload: { ...row.payload }, createdAt: new Date(row.createdAt) }));
    },
    async listClientHistory(workspaceId, clientId) {
      const projectIds = new Set(
        [...projects.values()]
          .filter((row) => row.clientId === clientId)
          .map((row) => row.id),
      );
      return activities
        .filter((row) => row.workspaceId === workspaceId)
        .filter(
          (row) =>
            (row.entityType === "client" && row.entityId === clientId) ||
            (row.entityType === "project" && projectIds.has(row.entityId)),
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row, payload: { ...row.payload }, createdAt: new Date(row.createdAt) }));
    },
  };
}

export const TEST_MEMBERS: MemberRecord[] = [
  {
    userId: "seed-user",
    workspaceId: "ws-1",
    name: "Owner",
    email: "owner@example.com",
  },
  {
    userId: "member-user",
    workspaceId: "ws-1",
    name: "Membro",
    email: "member@example.com",
  },
  {
    userId: "seed-user-b",
    workspaceId: "ws-2",
    name: "Owner B",
    email: "owner-b@example.com",
  },
];
