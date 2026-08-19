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
import type { ApprovalKind, ApprovalSnapshot, ApprovalStatus } from "../domain/approval-status.js";
import {
  summarizeOpenBlockers,
  type BlockerAssigneeKind,
  type BlockerStatus,
} from "../domain/blocker-status.js";
import type { ValidationStatus, ValidationType } from "../domain/validation-status.js";
import { instantiateProjectStages } from "../domain/stage-instance.js";
import { ensureDeployStagingForWorkspace } from "../checklists/seed.js";
import { ensureSaasDeliveryForWorkspace, type SaasTemplateRow } from "../projects/saas-seed.js";
import type {
  ActivityRecord,
  ApprovalCreateInput,
  ApprovalFilters,
  ApprovalRecord,
  BlockerCreateInput,
  BlockerFilters,
  BlockerRecord,
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
  ValidationCreateInput,
  ValidationFilters,
  ValidationRecord,
  ValidationUpdateInput,
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
          blockers: { where: { status: "open" }, select: { assigneeKind: true } },
        },
      });
      const cards: PipelineCardRow[] = [];
      for (const row of rows) {
        if (!row.currentStage) continue;
        const summary = summarizeOpenBlockers(row.blockers);
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
          openBlockerCount: summary.openBlockerCount,
          waitingOnClient: summary.waitingOnClient,
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
          await tx.blocker.deleteMany({ where: { projectId: id } });
          await tx.approval.deleteMany({ where: { projectId: id } });
          await tx.validation.deleteMany({ where: { projectId: id } });
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
    async getProjectChecklist(id) {
      const row = await prisma.projectChecklist.findUnique({
        where: { id },
        include: checklistInclude,
      });
      return row ? mapProjectChecklist(row) : null;
    },
    async setChecklistValidationId(id, validationId) {
      try {
        const row = await prisma.projectChecklist.update({
          where: { id },
          data: { validationId },
          include: checklistInclude,
        });
        return mapProjectChecklist(row);
      } catch {
        return null;
      }
    },
    async listValidations(workspaceId, filters: ValidationFilters) {
      const rows = await prisma.validation.findMany({
        where: validationWhere(workspaceId, filters),
        include: validationInclude,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapValidation);
    },
    async listProjectValidations(projectId) {
      const rows = await prisma.validation.findMany({
        where: { projectId },
        include: validationInclude,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapValidation);
    },
    async getValidation(id) {
      const row = await prisma.validation.findUnique({
        where: { id },
        include: validationInclude,
      });
      return row ? mapValidation(row) : null;
    },
    async createValidation(data: ValidationCreateInput) {
      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project || project.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.stageId) {
        const stage = await prisma.stage.findUnique({ where: { id: data.stageId } });
        if (!stage || stage.projectId !== project.id) {
          return null;
        }
      }
      if (data.checklistId) {
        const checklist = await prisma.projectChecklist.findUnique({ where: { id: data.checklistId } });
        if (!checklist || checklist.projectId !== project.id) {
          return null;
        }
      }
      try {
        const created = await prisma.$transaction(async (tx) => {
          const row = await tx.validation.create({
            data: {
              workspaceId: data.workspaceId,
              projectId: data.projectId,
              stageId: data.stageId,
              type: data.type,
              reviewerUserId: data.reviewerUserId,
              requesterUserId: data.requesterUserId,
              environment: data.environment,
              dueDate: data.dueDate,
              notes: data.notes,
              items: data.items,
              checklistId: data.checklistId,
              createdAt: data.now,
              updatedAt: data.now,
            },
            include: validationInclude,
          });
          if (data.checklistId) {
            await tx.projectChecklist.update({
              where: { id: data.checklistId },
              data: { validationId: row.id, updatedAt: data.now },
            });
          }
          return row;
        });
        return mapValidation(created);
      } catch {
        return null;
      }
    },
    async updateValidation(id, data: ValidationUpdateInput) {
      const current = await prisma.validation.findUnique({ where: { id } });
      if (!current) {
        return null;
      }
      if (data.stageId) {
        const stage = await prisma.stage.findUnique({ where: { id: data.stageId } });
        if (!stage || stage.projectId !== current.projectId) {
          return null;
        }
      }
      if (data.checklistId) {
        const checklist = await prisma.projectChecklist.findUnique({ where: { id: data.checklistId } });
        if (!checklist || checklist.projectId !== current.projectId) {
          return null;
        }
      }
      try {
        const updated = await prisma.$transaction(async (tx) => {
          const row = await tx.validation.update({
            where: { id },
            data: {
              ...(data.type !== undefined ? { type: data.type } : {}),
              ...(data.reviewerUserId !== undefined ? { reviewerUserId: data.reviewerUserId } : {}),
              ...(data.environment !== undefined ? { environment: data.environment } : {}),
              ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
              ...(data.notes !== undefined ? { notes: data.notes } : {}),
              ...(data.items !== undefined ? { items: data.items } : {}),
              ...(data.resultNotes !== undefined ? { resultNotes: data.resultNotes } : {}),
              ...(data.stageId !== undefined ? { stageId: data.stageId } : {}),
              ...(data.checklistId !== undefined ? { checklistId: data.checklistId } : {}),
            },
            include: validationInclude,
          });
          if (data.checklistId !== undefined && data.checklistId !== current.checklistId) {
            if (current.checklistId) {
              await tx.projectChecklist.updateMany({
                where: { id: current.checklistId, validationId: id },
                data: { validationId: null },
              });
            }
            if (data.checklistId) {
              await tx.projectChecklist.update({
                where: { id: data.checklistId },
                data: { validationId: id },
              });
            }
          }
          return row;
        });
        return mapValidation(updated);
      } catch {
        return null;
      }
    },
    async persistValidationTransition(input) {
      try {
        const row = await prisma.validation.update({
          where: { id: input.id },
          data: {
            status: input.status,
            requestedAt: input.requestedAt,
            ...(input.resultNotes !== undefined ? { resultNotes: input.resultNotes } : {}),
          },
          include: validationInclude,
        });
        return mapValidation(row);
      } catch {
        return null;
      }
    },
    async listApprovals(workspaceId, filters: ApprovalFilters) {
      const rows = await prisma.approval.findMany({
        where: approvalWhere(workspaceId, filters),
        include: approvalInclude,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapApproval);
    },
    async listProjectApprovals(projectId) {
      const rows = await prisma.approval.findMany({
        where: { projectId },
        include: approvalInclude,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapApproval);
    },
    async getApproval(id) {
      const row = await prisma.approval.findUnique({
        where: { id },
        include: approvalInclude,
      });
      return row ? mapApproval(row) : null;
    },
    async createApproval(data: ApprovalCreateInput) {
      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project || project.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.validationId) {
        const validation = await prisma.validation.findUnique({ where: { id: data.validationId } });
        if (!validation || validation.projectId !== project.id) {
          return null;
        }
      }
      try {
        const row = await prisma.approval.create({
          data: {
            workspaceId: data.workspaceId,
            projectId: data.projectId,
            subjectType: "project",
            subjectId: data.projectId,
            kind: data.kind,
            validationId: data.validationId,
            comment: data.comment,
            projectSnapshot: data.projectSnapshot,
            createdAt: data.now,
            updatedAt: data.now,
          },
          include: approvalInclude,
        });
        return mapApproval(row);
      } catch {
        return null;
      }
    },
    async persistApprovalDecision(input) {
      try {
        const row = await prisma.approval.update({
          where: { id: input.id },
          data: {
            status: input.status,
            approverId: input.approverId,
            decidedAt: input.decidedAt,
            revokedAt: input.revokedAt,
            comment: input.comment,
          },
          include: approvalInclude,
        });
        return mapApproval(row);
      } catch {
        return null;
      }
    },
    async listBlockers(workspaceId, filters: BlockerFilters) {
      const rows = await prisma.blocker.findMany({
        where: blockerWhere(workspaceId, filters),
        include: blockerInclude,
        orderBy: { openedAt: "desc" },
      });
      return rows.map(mapBlocker);
    },
    async listProjectBlockers(projectId) {
      const rows = await prisma.blocker.findMany({
        where: { projectId },
        include: blockerInclude,
        orderBy: { openedAt: "desc" },
      });
      return rows.map(mapBlocker);
    },
    async getBlocker(id) {
      const row = await prisma.blocker.findUnique({
        where: { id },
        include: blockerInclude,
      });
      return row ? mapBlocker(row) : null;
    },
    async createBlocker(data: BlockerCreateInput) {
      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project || project.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.blocksStageId) {
        const stage = await prisma.stage.findUnique({ where: { id: data.blocksStageId } });
        if (!stage || stage.projectId !== project.id) {
          return null;
        }
      }
      try {
        const row = await prisma.blocker.create({
          data: {
            workspaceId: data.workspaceId,
            projectId: data.projectId,
            title: data.title,
            assigneeKind: data.assigneeKind,
            assigneeUserId: data.assigneeUserId,
            blocksStageId: data.blocksStageId,
            blocksProject: data.blocksProject,
            dueDate: data.dueDate,
            notes: data.notes,
            sourceMeetingId: data.sourceMeetingId,
            openedAt: data.now,
            createdAt: data.now,
            updatedAt: data.now,
          },
          include: blockerInclude,
        });
        return mapBlocker(row);
      } catch {
        return null;
      }
    },
    async persistBlockerDecision(input) {
      try {
        const row = await prisma.blocker.update({
          where: { id: input.id },
          data: {
            status: input.status,
            resolvedAt: input.resolvedAt,
            cancelledAt: input.cancelledAt,
            notes: input.notes,
          },
          include: blockerInclude,
        });
        return mapBlocker(row);
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

const validationInclude = {
  project: { include: { client: { select: { id: true, name: true } } } },
  reviewer: { select: { name: true, email: true } },
  requester: { select: { name: true, email: true } },
} as const;

function validationWhere(workspaceId: string, filters: ValidationFilters): Prisma.ValidationWhereInput {
  return {
    workspaceId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.reviewerUserId ? { reviewerUserId: filters.reviewerUserId } : {}),
    ...(filters.clientId ? { project: { clientId: filters.clientId } } : {}),
    ...(filters.dueBefore || filters.dueAfter
      ? {
          dueDate: {
            ...(filters.dueBefore ? { lte: filters.dueBefore } : {}),
            ...(filters.dueAfter ? { gte: filters.dueAfter } : {}),
          },
        }
      : {}),
  };
}

function displayName(user: { name: string | null; email: string } | null): string | null {
  if (!user) return null;
  return user.name ?? user.email;
}

function mapValidation(row: {
  id: string;
  workspaceId: string;
  projectId: string;
  stageId: string | null;
  type: ValidationType;
  reviewerUserId: string | null;
  requesterUserId: string;
  environment: string | null;
  status: ValidationStatus;
  requestedAt: Date | null;
  dueDate: Date | null;
  notes: string | null;
  items: Prisma.JsonValue;
  resultNotes: string | null;
  checklistId: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: { name: string; clientId: string; client: { id: string; name: string } };
  reviewer: { name: string | null; email: string } | null;
  requester: { name: string | null; email: string };
}): ValidationRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.project.name,
    clientId: row.project.client.id,
    clientName: row.project.client.name,
    stageId: row.stageId,
    type: row.type,
    reviewerUserId: row.reviewerUserId,
    reviewerName: displayName(row.reviewer),
    requesterUserId: row.requesterUserId,
    requesterName: displayName(row.requester),
    environment: row.environment,
    status: row.status,
    requestedAt: row.requestedAt,
    dueDate: row.dueDate,
    notes: row.notes,
    items: asStringArray(row.items),
    resultNotes: row.resultNotes,
    checklistId: row.checklistId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const approvalInclude = {
  project: { include: { client: { select: { id: true, name: true } } } },
  approver: { select: { name: true, email: true } },
} as const;

function approvalWhere(workspaceId: string, filters: ApprovalFilters): Prisma.ApprovalWhereInput {
  return {
    workspaceId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.kind ? { kind: filters.kind } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.approverId ? { approverId: filters.approverId } : {}),
    ...(filters.clientId ? { project: { clientId: filters.clientId } } : {}),
  };
}

function mapApprovalSnapshot(value: Prisma.JsonValue): ApprovalSnapshot {
  const obj = jsonObject(value);
  return {
    currentStageKey: typeof obj.currentStageKey === "string" ? obj.currentStageKey : null,
    projectStatus: (typeof obj.projectStatus === "string" ? obj.projectStatus : "draft") as ProjectStatus,
    validationId: typeof obj.validationId === "string" ? obj.validationId : null,
    projectId: typeof obj.projectId === "string" ? obj.projectId : "",
    clientId: typeof obj.clientId === "string" ? obj.clientId : "",
  };
}

function mapApproval(row: {
  id: string;
  workspaceId: string;
  projectId: string;
  subjectType: string;
  subjectId: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  validationId: string | null;
  approverId: string | null;
  decidedAt: Date | null;
  revokedAt: Date | null;
  comment: string | null;
  projectSnapshot: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  project: { name: string; clientId: string; client: { id: string; name: string } };
  approver: { name: string | null; email: string } | null;
}): ApprovalRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.project.name,
    clientId: row.project.client.id,
    clientName: row.project.client.name,
    subjectType: "project",
    subjectId: row.subjectId,
    kind: row.kind,
    status: row.status,
    validationId: row.validationId,
    approverId: row.approverId,
    approverName: displayName(row.approver),
    decidedAt: row.decidedAt,
    revokedAt: row.revokedAt,
    comment: row.comment,
    projectSnapshot: mapApprovalSnapshot(row.projectSnapshot),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const blockerInclude = {
  project: { include: { client: { select: { id: true, name: true } } } },
  assignee: { select: { name: true, email: true } },
} as const;

function blockerWhere(workspaceId: string, filters: BlockerFilters): Prisma.BlockerWhereInput {
  const now = filters.now ?? new Date();
  return {
    workspaceId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.assigneeKind ? { assigneeKind: filters.assigneeKind } : {}),
    ...(filters.assigneeUserId ? { assigneeUserId: filters.assigneeUserId } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.clientId ? { project: { clientId: filters.clientId } } : {}),
    ...(filters.blocking
      ? { OR: [{ blocksProject: true }, { blocksStageId: { not: null } }] }
      : {}),
    ...(filters.overdue ? { status: "open", dueDate: { not: null, lt: now } } : {}),
  };
}

function mapBlocker(row: {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  assigneeKind: BlockerAssigneeKind;
  assigneeUserId: string | null;
  blocksStageId: string | null;
  blocksProject: boolean;
  status: BlockerStatus;
  dueDate: Date | null;
  openedAt: Date;
  resolvedAt: Date | null;
  cancelledAt: Date | null;
  sourceMeetingId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: { name: string; clientId: string; client: { id: string; name: string } };
  assignee: { name: string | null; email: string } | null;
}): BlockerRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.project.name,
    clientId: row.project.client.id,
    clientName: row.project.client.name,
    title: row.title,
    assigneeKind: row.assigneeKind,
    assigneeUserId: row.assigneeUserId,
    assigneeName: displayName(row.assignee),
    blocksStageId: row.blocksStageId,
    blocksProject: row.blocksProject,
    status: row.status,
    dueDate: row.dueDate,
    openedAt: row.openedAt,
    resolvedAt: row.resolvedAt,
    cancelledAt: row.cancelledAt,
    sourceMeetingId: row.sourceMeetingId,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

