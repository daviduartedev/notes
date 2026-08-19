import type { Prisma, PrismaClient } from "@prisma/client";
import { instantiateProjectChecklist } from "../domain/checklist-instance.js";
import { PIPELINE_BOARD_STATUSES, type PipelineCardRow } from "../domain/pipeline-board.js";
import type {
  ActivityAction,
  ClientStatus,
  EntityType,
  ProjectPriority,
  ProjectStatus,
  StagePhase,
  StageStatus,
} from "../domain/types.js";
import { instantiateProjectStages } from "../domain/stage-instance.js";
import { ensureDeployStagingForWorkspace } from "../checklists/seed.js";
import { ensureSaasDeliveryForWorkspace, type SaasTemplateRow } from "../projects/saas-seed.js";
import type {
  ActivityRecord,
  ChecklistItemLookup,
  ChecklistItemRecord,
  ChecklistTemplateRecord,
  ClientCreateInput,
  ClientFilters,
  ClientRecord,
  NotesStore,
  PipelineFilters,
  ProjectChecklistRecord,
  ProjectCreateInput,
  ProjectFilters,
  ProjectRecord,
  StagePersistPatch,
  StageRecord,
} from "./types.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

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
  workflowTemplateId: string | null;
  currentStageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectRecord {
  return { ...row };
}

function asStringArray(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value as string[];
  }
  return [];
}

function mapStage(row: {
  id: string;
  workspaceId: string;
  projectId: string;
  stageTemplateId: string | null;
  key: string;
  label: string;
  phase: StagePhase;
  order: number;
  allowedNextKeys: Prisma.JsonValue;
  entryCriteria: string;
  exitCriteria: string;
  status: StageStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): StageRecord {
  return {
    ...row,
    allowedNextKeys: asStringArray(row.allowedNextKeys),
  };
}

function templateSnapshots(template: SaasTemplateRow) {
  return template.stages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      key: stage.key,
      label: stage.label,
      phase: stage.phase,
      order: stage.order,
      allowedNextKeys: asStringArray(stage.allowedNextKeys as Prisma.JsonValue),
      entryCriteria: stage.entryCriteria,
      exitCriteria: stage.exitCriteria,
    }));
}

async function copyStagesOntoProject(
  db: DbClient,
  project: { id: string; workspaceId: string },
  now: Date,
): Promise<{ currentStageId: string; workflowTemplateId: string }> {
  const template = await ensureSaasDeliveryForWorkspace(db, project.workspaceId);
  const instanced = instantiateProjectStages(templateSnapshots(template));
  await db.stage.createMany({
    data: instanced.stages.map((stage) => ({
      id: stage.id,
      workspaceId: project.workspaceId,
      projectId: project.id,
      stageTemplateId: template.stages.find((item) => item.key === stage.key)?.id ?? null,
      key: stage.key,
      label: stage.label,
      phase: stage.phase,
      order: stage.order,
      allowedNextKeys: stage.allowedNextKeys,
      entryCriteria: stage.entryCriteria,
      exitCriteria: stage.exitCriteria,
      status: stage.status,
      startedAt: stage.id === instanced.currentStageId ? now : null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    })),
  });
  await db.project.update({
    where: { id: project.id },
    data: {
      workflowTemplateId: template.id,
      currentStageId: instanced.currentStageId,
    },
  });
  return { currentStageId: instanced.currentStageId, workflowTemplateId: template.id };
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
    async listPipelineCards(workspaceId, filters: PipelineFilters) {
      const rows = await prisma.project.findMany({
        where: {
          workspaceId,
          status: { in: [...PIPELINE_BOARD_STATUSES] },
          currentStageId: { not: null },
          ...(filters.ownerUserId ? { ownerUserId: filters.ownerUserId } : {}),
          ...(filters.clientId ? { clientId: filters.clientId } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
        },
        include: {
          client: { select: { name: true } },
          currentStage: { select: { key: true, label: true, status: true } },
          owner: { select: { name: true, email: true } },
        },
      });
      const cards: PipelineCardRow[] = [];
      for (const row of rows) {
        if (!row.currentStage) continue;
        cards.push({
          id: row.id,
          name: row.name,
          clientId: row.clientId,
          clientName: row.client.name,
          ownerUserId: row.ownerUserId,
          ownerName: row.owner.name ?? row.owner.email,
          dueDate: row.dueDate,
          priority: row.priority,
          status: row.status,
          currentStageKey: row.currentStage.key,
          currentStageLabel: row.currentStage.label,
          stageStatus: row.currentStage.status,
        });
      }
      return cards;
    },
    async getProject(id) {
      const row = await prisma.project.findUnique({ where: { id } });
      return row ? mapProject(row) : null;
    },
    async createProject(data: ProjectCreateInput) {
      const now = new Date();
      return prisma.$transaction(async (tx) => {
        const created = await tx.project.create({ data });
        const copied = await copyStagesOntoProject(tx, created, now);
        return mapProject({
          ...created,
          workflowTemplateId: copied.workflowTemplateId,
          currentStageId: copied.currentStageId,
          updatedAt: now,
        });
      });
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
        await prisma.$transaction(async (tx) => {
          await tx.projectChecklist.deleteMany({ where: { projectId: id } });
          await tx.project.update({
            where: { id },
            data: { currentStageId: null },
          });
          await tx.stage.deleteMany({ where: { projectId: id } });
          await tx.project.delete({ where: { id } });
        });
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
    async listStagesByProject(projectId) {
      const rows = await prisma.stage.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
      });
      return rows.map(mapStage);
    },
    async getStage(id) {
      const row = await prisma.stage.findUnique({ where: { id } });
      return row ? mapStage(row) : null;
    },
    async hydrateProjectStages(projectId, now) {
      const existing = await prisma.stage.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
      });
      if (existing.length > 0) {
        return existing.map(mapStage);
      }
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return [];
      }
      await prisma.$transaction(async (tx) => {
        await copyStagesOntoProject(tx, project, now);
      });
      const rows = await prisma.stage.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
      });
      return rows.map(mapStage);
    },
    async persistStageAction(input: {
      projectId: string;
      currentStageId: string;
      patches: StagePersistPatch[];
    }) {
      await prisma.$transaction(async (tx) => {
        for (const patch of input.patches) {
          await tx.stage.update({
            where: { id: patch.id },
            data: {
              status: patch.status,
              ...(patch.startedAt !== undefined ? { startedAt: patch.startedAt } : {}),
              ...(patch.completedAt !== undefined ? { completedAt: patch.completedAt } : {}),
            },
          });
        }
        await tx.project.update({
          where: { id: input.projectId },
          data: { currentStageId: input.currentStageId },
        });
      });
    },
    async updateStageTemplateAllowedNextKeys(workflowTemplateId, key, allowedNextKeys) {
      try {
        await prisma.stageTemplate.update({
          where: { workflowTemplateId_key: { workflowTemplateId, key } },
          data: { allowedNextKeys },
        });
        return true;
      } catch {
        return false;
      }
    },
    async backfillMissingStages(workspaceId, now) {
      const projects = await prisma.project.findMany({
        where: { workspaceId, stages: { none: {} } },
        select: { id: true, workspaceId: true },
      });
      for (const project of projects) {
        await prisma.$transaction(async (tx) => {
          await copyStagesOntoProject(tx, project, now);
        });
      }
      return projects.length;
    },
    async listChecklistTemplates(workspaceId) {
      await ensureDeployStagingForWorkspace(prisma, workspaceId);
      const rows = await prisma.checklistTemplate.findMany({
        where: { workspaceId },
        include: { items: { orderBy: { order: "asc" } } },
        orderBy: { name: "asc" },
      });
      return rows.map(mapChecklistTemplate);
    },
    async getChecklistTemplate(id) {
      const row = await prisma.checklistTemplate.findUnique({
        where: { id },
        include: { items: { orderBy: { order: "asc" } } },
      });
      return row ? mapChecklistTemplate(row) : null;
    },
    async updateChecklistTemplate(id, data) {
      try {
        if (data.items) {
          for (const item of data.items) {
            await prisma.checklistTemplateItem.update({
              where: { id: item.id },
              data: { title: item.title },
            });
          }
        }
        const row = await prisma.checklistTemplate.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
          },
          include: { items: { orderBy: { order: "asc" } } },
        });
        return mapChecklistTemplate(row);
      } catch {
        return null;
      }
    },
    async applyChecklist(input) {
      const project = await prisma.project.findUnique({ where: { id: input.projectId } });
      if (!project || project.workspaceId !== input.workspaceId) {
        return null;
      }
      const template = await prisma.checklistTemplate.findUnique({
        where: { id: input.templateId },
        include: { items: { orderBy: { order: "asc" } } },
      });
      if (!template || template.workspaceId !== input.workspaceId) {
        return null;
      }
      if (input.stageId) {
        const stage = await prisma.stage.findUnique({ where: { id: input.stageId } });
        if (!stage || stage.projectId !== project.id) {
          return null;
        }
      }
      const copy = instantiateProjectChecklist({
        id: template.id,
        name: template.name,
        items: template.items.map((item) => ({ title: item.title, order: item.order })),
      });
      const created = await prisma.projectChecklist.create({
        data: {
          workspaceId: input.workspaceId,
          projectId: project.id,
          stageId: input.stageId,
          templateId: template.id,
          name: copy.name,
          validationId: copy.validationId,
          createdAt: input.now,
          updatedAt: input.now,
          items: {
            create: copy.items.map((item) => ({
              title: item.title,
              order: item.order,
            })),
          },
        },
        include: checklistInclude,
      });
      return mapProjectChecklist(created);
    },
    async listProjectChecklists(projectId) {
      const rows = await prisma.projectChecklist.findMany({
        where: { projectId },
        include: checklistInclude,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapProjectChecklist);
    },
    async listWorkspaceChecklists(workspaceId) {
      const rows = await prisma.projectChecklist.findMany({
        where: { workspaceId },
        include: checklistInclude,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapProjectChecklist);
    },
    async getChecklistItem(id) {
      const row = await prisma.checklistItem.findUnique({
        where: { id },
        include: itemLookupInclude,
      });
      return row ? mapChecklistItemLookup(row) : null;
    },
    async updateChecklistItem(id, data) {
      try {
        const row = await prisma.checklistItem.update({
          where: { id },
          data: {
            completedAt: data.completedAt,
            completedByUserId: data.completedByUserId,
            note: data.note,
          },
          include: itemLookupInclude,
        });
        return mapChecklistItemLookup(row);
      } catch {
        return null;
      }
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

const checklistInclude = {
  project: { select: { name: true } },
  items: {
    orderBy: { order: "asc" as const },
    include: { completedBy: { select: { name: true, email: true } } },
  },
};

const itemLookupInclude = {
  completedBy: { select: { name: true, email: true } },
  checklist: { select: { workspaceId: true, projectId: true } },
};

function mapChecklistTemplate(row: {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string | null;
  items: Array<{ id: string; title: string; order: number }>;
}): ChecklistTemplateRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    key: row.key,
    name: row.name,
    description: row.description,
    items: row.items.map((item) => ({ id: item.id, title: item.title, order: item.order })),
  };
}

function mapChecklistItem(row: {
  id: string;
  checklistId: string;
  title: string;
  order: number;
  completedAt: Date | null;
  completedByUserId: string | null;
  note: string | null;
  completedBy: { name: string | null; email: string } | null;
}): ChecklistItemRecord {
  return {
    id: row.id,
    checklistId: row.checklistId,
    title: row.title,
    order: row.order,
    completedAt: row.completedAt,
    completedByUserId: row.completedByUserId,
    completedByName: row.completedBy?.name ?? row.completedBy?.email ?? null,
    note: row.note,
  };
}

function mapProjectChecklist(row: {
  id: string;
  workspaceId: string;
  projectId: string;
  stageId: string | null;
  templateId: string | null;
  name: string;
  validationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: { name: string };
  items: Array<{
    id: string;
    checklistId: string;
    title: string;
    order: number;
    completedAt: Date | null;
    completedByUserId: string | null;
    note: string | null;
    completedBy: { name: string | null; email: string } | null;
  }>;
}): ProjectChecklistRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.project.name,
    stageId: row.stageId,
    templateId: row.templateId,
    name: row.name,
    validationId: row.validationId,
    items: row.items.map(mapChecklistItem),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapChecklistItemLookup(row: {
  id: string;
  checklistId: string;
  title: string;
  order: number;
  completedAt: Date | null;
  completedByUserId: string | null;
  note: string | null;
  completedBy: { name: string | null; email: string } | null;
  checklist: { workspaceId: string; projectId: string };
}): ChecklistItemLookup {
  return {
    ...mapChecklistItem(row),
    workspaceId: row.checklist.workspaceId,
    projectId: row.checklist.projectId,
  };
}
