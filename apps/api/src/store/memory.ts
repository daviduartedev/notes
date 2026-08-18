import { SAAS_DELIVERY_STAGES } from "../domain/saas-delivery-template.js";
import { instantiateProjectStages } from "../domain/stage-instance.js";
import type { StagePhase } from "../domain/types.js";
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
  StagePersistPatch,
  StageRecord,
} from "./types.js";

type TemplateRow = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  stages: Array<{
    id: string;
    key: string;
    label: string;
    phase: StagePhase;
    order: number;
    allowedNextKeys: string[];
    entryCriteria: string;
    exitCriteria: string;
  }>;
};

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

function cloneStage(row: StageRecord): StageRecord {
  return {
    ...row,
    allowedNextKeys: [...row.allowedNextKeys],
    startedAt: row.startedAt ? new Date(row.startedAt) : null,
    completedAt: row.completedAt ? new Date(row.completedAt) : null,
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
  const stages = new Map<string, StageRecord>();
  const templates = new Map<string, TemplateRow>();
  const activities: ActivityRecord[] = [];

  function ensureTemplate(workspaceId: string): TemplateRow {
    const existing = [...templates.values()].find(
      (row) => row.workspaceId === workspaceId && row.key === "saas_delivery",
    );
    if (existing) {
      return existing;
    }
    const templateId = crypto.randomUUID();
    const row: TemplateRow = {
      id: templateId,
      workspaceId,
      key: "saas_delivery",
      name: "SaaS delivery",
      stages: SAAS_DELIVERY_STAGES.map((stage) => ({
        id: crypto.randomUUID(),
        key: stage.key,
        label: stage.label,
        phase: stage.phase,
        order: stage.order,
        allowedNextKeys: [...stage.allowedNextKeys],
        entryCriteria: stage.entryCriteria,
        exitCriteria: stage.exitCriteria,
      })),
    };
    templates.set(templateId, row);
    return row;
  }

  function copyStagesOntoProject(project: ProjectRecord, now: Date): StageRecord[] {
    const template = ensureTemplate(project.workspaceId);
    const instanced = instantiateProjectStages(template.stages);
    const created: StageRecord[] = instanced.stages.map((stage) => ({
      id: stage.id,
      workspaceId: project.workspaceId,
      projectId: project.id,
      stageTemplateId: template.stages.find((item) => item.key === stage.key)?.id ?? null,
      key: stage.key,
      label: stage.label,
      phase: stage.phase,
      order: stage.order,
      allowedNextKeys: [...stage.allowedNextKeys],
      entryCriteria: stage.entryCriteria,
      exitCriteria: stage.exitCriteria,
      status: stage.status,
      startedAt: stage.id === instanced.currentStageId ? now : null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }));
    for (const row of created) {
      stages.set(row.id, row);
    }
    project.workflowTemplateId = template.id;
    project.currentStageId = instanced.currentStageId;
    project.updatedAt = now;
    projects.set(project.id, project);
    return created.map(cloneStage);
  }

  function stagesOf(projectId: string): StageRecord[] {
    return [...stages.values()]
      .filter((row) => row.projectId === projectId)
      .sort((a, b) => a.order - b.order)
      .map(cloneStage);
  }

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
        workflowTemplateId: null,
        currentStageId: null,
        createdAt: now,
        updatedAt: now,
      };
      projects.set(row.id, row);
      copyStagesOntoProject(row, now);
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
      const current = projects.get(id);
      if (current) {
        current.currentStageId = null;
        for (const [stageId, stage] of stages) {
          if (stage.projectId === id) {
            stages.delete(stageId);
          }
        }
      }
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
    async listStagesByProject(projectId) {
      return stagesOf(projectId);
    },
    async getStage(id) {
      const row = stages.get(id);
      return row ? cloneStage(row) : null;
    },
    async hydrateProjectStages(projectId, now) {
      const project = projects.get(projectId);
      if (!project) {
        return [];
      }
      const existing = stagesOf(projectId);
      if (existing.length > 0) {
        return existing;
      }
      return copyStagesOntoProject(project, now);
    },
    async persistStageAction(input: {
      projectId: string;
      currentStageId: string;
      patches: StagePersistPatch[];
    }) {
      const project = projects.get(input.projectId);
      if (!project) {
        return;
      }
      const now = new Date();
      for (const patch of input.patches) {
        const current = stages.get(patch.id);
        if (!current) continue;
        stages.set(patch.id, {
          ...current,
          status: patch.status,
          startedAt: patch.startedAt !== undefined ? patch.startedAt : current.startedAt,
          completedAt: patch.completedAt !== undefined ? patch.completedAt : current.completedAt,
          updatedAt: now,
        });
      }
      project.currentStageId = input.currentStageId;
      project.updatedAt = now;
      projects.set(project.id, project);
    },
    async updateStageTemplateAllowedNextKeys(workflowTemplateId, key, allowedNextKeys) {
      const template = templates.get(workflowTemplateId);
      if (!template) {
        return false;
      }
      const stage = template.stages.find((item) => item.key === key);
      if (!stage) {
        return false;
      }
      stage.allowedNextKeys = [...allowedNextKeys];
      return true;
    },
    async backfillMissingStages(workspaceId, now) {
      let count = 0;
      for (const project of projects.values()) {
        if (project.workspaceId !== workspaceId) continue;
        if (stagesOf(project.id).length > 0) continue;
        copyStagesOntoProject(project, now);
        count += 1;
      }
      return count;
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
