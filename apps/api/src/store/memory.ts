import { instantiateProjectChecklist } from "../domain/checklist-instance.js";
import {
  DEPLOY_STAGING_ITEMS,
  DEPLOY_STAGING_TEMPLATE_DESCRIPTION,
  DEPLOY_STAGING_TEMPLATE_KEY,
  DEPLOY_STAGING_TEMPLATE_NAME,
} from "../domain/deploy-staging-template.js";
import { PIPELINE_BOARD_STATUSES, type PipelineCardRow } from "../domain/pipeline-board.js";
import { SAAS_DELIVERY_STAGES } from "../domain/saas-delivery-template.js";
import { instantiateProjectStages } from "../domain/stage-instance.js";
import type { StagePhase } from "../domain/types.js";
import type {
  ApprovalKind,
  ApprovalSnapshot,
  ApprovalStatus,
} from "../domain/approval-status.js";
import {
  summarizeOpenBlockers,
  type BlockerAssigneeKind,
  type BlockerStatus,
} from "../domain/blocker-status.js";
import type {
  ValidationStatus,
  ValidationType,
} from "../domain/validation-status.js";
import type {
  ActivityCreateInput,
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
  ChecklistTemplateUpdateInput,
  ClientCreateInput,
  ClientFilters,
  ClientRecord,
  ClientUpdateInput,
  MemberRecord,
  NotesStore,
  PipelineFilters,
  ProjectChecklistRecord,
  ProjectCreateInput,
  ProjectFilters,
  ProjectRecord,
  ProjectUpdateInput,
  StagePersistPatch,
  StageRecord,
  ValidationCreateInput,
  ValidationFilters,
  ValidationRecord,
  ValidationUpdateInput,
} from "./types.js";

type ChecklistTemplateRow = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string | null;
  items: Array<{ id: string; title: string; order: number }>;
};

type ChecklistRow = {
  id: string;
  workspaceId: string;
  projectId: string;
  stageId: string | null;
  templateId: string | null;
  name: string;
  validationId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ChecklistItemRow = {
  id: string;
  checklistId: string;
  title: string;
  order: number;
  completedAt: Date | null;
  completedByUserId: string | null;
  note: string | null;
};

type ValidationRow = {
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
  items: string[];
  resultNotes: string | null;
  checklistId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ApprovalRow = {
  id: string;
  workspaceId: string;
  projectId: string;
  subjectType: "project";
  subjectId: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  validationId: string | null;
  approverId: string | null;
  decidedAt: Date | null;
  revokedAt: Date | null;
  comment: string | null;
  projectSnapshot: ApprovalSnapshot;
  createdAt: Date;
  updatedAt: Date;
};

type BlockerRow = {
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
};

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

function cloneChecklistTemplate(row: ChecklistTemplateRow): ChecklistTemplateRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    key: row.key,
    name: row.name,
    description: row.description,
    items: row.items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ ...item })),
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

function matchesValidationFilters(
  row: ValidationRow,
  project: ProjectRecord | undefined,
  filters: ValidationFilters,
): boolean {
  if (filters.status && row.status !== filters.status) return false;
  if (filters.projectId && row.projectId !== filters.projectId) return false;
  if (filters.reviewerUserId && row.reviewerUserId !== filters.reviewerUserId) return false;
  if (filters.clientId && project?.clientId !== filters.clientId) return false;
  if (filters.dueBefore && (!row.dueDate || row.dueDate.getTime() > filters.dueBefore.getTime())) {
    return false;
  }
  if (filters.dueAfter && (!row.dueDate || row.dueDate.getTime() < filters.dueAfter.getTime())) {
    return false;
  }
  return true;
}

function matchesApprovalFilters(
  row: ApprovalRow,
  project: ProjectRecord | undefined,
  filters: ApprovalFilters,
): boolean {
  if (filters.status && row.status !== filters.status) return false;
  if (filters.kind && row.kind !== filters.kind) return false;
  if (filters.projectId && row.projectId !== filters.projectId) return false;
  if (filters.approverId && row.approverId !== filters.approverId) return false;
  if (filters.clientId && project?.clientId !== filters.clientId) return false;
  return true;
}

function matchesBlockerFilters(
  row: BlockerRow,
  project: ProjectRecord | undefined,
  filters: BlockerFilters,
): boolean {
  if (filters.status && row.status !== filters.status) return false;
  if (filters.assigneeKind && row.assigneeKind !== filters.assigneeKind) return false;
  if (filters.assigneeUserId && row.assigneeUserId !== filters.assigneeUserId) return false;
  if (filters.projectId && row.projectId !== filters.projectId) return false;
  if (filters.clientId && project?.clientId !== filters.clientId) return false;
  if (filters.blocking && !row.blocksProject && !row.blocksStageId) return false;
  if (filters.overdue) {
    const now = filters.now ?? new Date();
    if (row.status !== "open" || !row.dueDate || row.dueDate.getTime() >= now.getTime()) {
      return false;
    }
  }
  return true;
}

export function createMemoryStore(seedMembers: MemberRecord[] = []): NotesStore {
  const members = [...seedMembers];
  const clients = new Map<string, ClientRecord>();
  const projects = new Map<string, ProjectRecord>();
  const stages = new Map<string, StageRecord>();
  const templates = new Map<string, TemplateRow>();
  const checklistTemplates = new Map<string, ChecklistTemplateRow>();
  const checklists = new Map<string, ChecklistRow>();
  const checklistItems = new Map<string, ChecklistItemRow>();
  const validations = new Map<string, ValidationRow>();
  const approvals = new Map<string, ApprovalRow>();
  const blockers = new Map<string, BlockerRow>();
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

  function actorName(userId: string | null): string | null {
    if (!userId) return null;
    const member = members.find((item) => item.userId === userId);
    return member?.name ?? member?.email ?? null;
  }

  function toItemRecord(row: ChecklistItemRow): ChecklistItemRecord {
    return {
      id: row.id,
      checklistId: row.checklistId,
      title: row.title,
      order: row.order,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      completedByUserId: row.completedByUserId,
      completedByName: actorName(row.completedByUserId),
      note: row.note,
    };
  }

  function toChecklistRecord(row: ChecklistRow): ProjectChecklistRecord {
    const project = projects.get(row.projectId);
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      projectId: row.projectId,
      projectName: project?.name ?? "",
      stageId: row.stageId,
      templateId: row.templateId,
      name: row.name,
      validationId: row.validationId,
      items: [...checklistItems.values()]
        .filter((item) => item.checklistId === row.id)
        .sort((a, b) => a.order - b.order)
        .map(toItemRecord),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  function toItemLookup(row: ChecklistItemRow): ChecklistItemLookup | null {
    const checklist = checklists.get(row.checklistId);
    if (!checklist) return null;
    return {
      ...toItemRecord(row),
      workspaceId: checklist.workspaceId,
      projectId: checklist.projectId,
    };
  }

  function toValidationRecord(row: ValidationRow): ValidationRecord | null {
    const project = projects.get(row.projectId);
    if (!project) return null;
    const client = clients.get(project.clientId);
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      projectId: row.projectId,
      projectName: project.name,
      clientId: project.clientId,
      clientName: client?.name ?? "",
      stageId: row.stageId,
      type: row.type,
      reviewerUserId: row.reviewerUserId,
      reviewerName: actorName(row.reviewerUserId),
      requesterUserId: row.requesterUserId,
      requesterName: actorName(row.requesterUserId),
      environment: row.environment,
      status: row.status,
      requestedAt: row.requestedAt ? new Date(row.requestedAt) : null,
      dueDate: row.dueDate ? new Date(row.dueDate) : null,
      notes: row.notes,
      items: [...row.items],
      resultNotes: row.resultNotes,
      checklistId: row.checklistId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  function toApprovalRecord(row: ApprovalRow): ApprovalRecord | null {
    const project = projects.get(row.projectId);
    if (!project) return null;
    const client = clients.get(project.clientId);
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      projectId: row.projectId,
      projectName: project.name,
      clientId: project.clientId,
      clientName: client?.name ?? "",
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      kind: row.kind,
      status: row.status,
      validationId: row.validationId,
      approverId: row.approverId,
      approverName: actorName(row.approverId),
      decidedAt: row.decidedAt ? new Date(row.decidedAt) : null,
      revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
      comment: row.comment,
      projectSnapshot: { ...row.projectSnapshot },
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  function toBlockerRecord(row: BlockerRow): BlockerRecord | null {
    const project = projects.get(row.projectId);
    if (!project) return null;
    const client = clients.get(project.clientId);
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      projectId: row.projectId,
      projectName: project.name,
      clientId: project.clientId,
      clientName: client?.name ?? "",
      title: row.title,
      assigneeKind: row.assigneeKind,
      assigneeUserId: row.assigneeUserId,
      assigneeName: actorName(row.assigneeUserId),
      blocksStageId: row.blocksStageId,
      blocksProject: row.blocksProject,
      status: row.status,
      dueDate: row.dueDate ? new Date(row.dueDate) : null,
      openedAt: new Date(row.openedAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      cancelledAt: row.cancelledAt ? new Date(row.cancelledAt) : null,
      sourceMeetingId: row.sourceMeetingId,
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  function ensureChecklistTemplate(workspaceId: string): ChecklistTemplateRow {
    const existing = [...checklistTemplates.values()].find(
      (row) => row.workspaceId === workspaceId && row.key === DEPLOY_STAGING_TEMPLATE_KEY,
    );
    if (existing) {
      return existing;
    }
    const templateId = crypto.randomUUID();
    const row: ChecklistTemplateRow = {
      id: templateId,
      workspaceId,
      key: DEPLOY_STAGING_TEMPLATE_KEY,
      name: DEPLOY_STAGING_TEMPLATE_NAME,
      description: DEPLOY_STAGING_TEMPLATE_DESCRIPTION,
      items: DEPLOY_STAGING_ITEMS.map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        order: item.order,
      })),
    };
    checklistTemplates.set(templateId, row);
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
    async listPipelineCards(workspaceId, filters: PipelineFilters) {
      const boardStatuses = new Set<string>(PIPELINE_BOARD_STATUSES);
      const memberByUser = new Map(
        members.filter((member) => member.workspaceId === workspaceId).map((member) => [member.userId, member]),
      );
      const cards: PipelineCardRow[] = [];
      for (const project of projects.values()) {
        if (project.workspaceId !== workspaceId) continue;
        if (!boardStatuses.has(project.status)) continue;
        if (!project.currentStageId) continue;
        if (filters.ownerUserId && project.ownerUserId !== filters.ownerUserId) continue;
        if (filters.clientId && project.clientId !== filters.clientId) continue;
        if (filters.priority && project.priority !== filters.priority) continue;
        const stage = stages.get(project.currentStageId);
        if (!stage) continue;
        const client = clients.get(project.clientId);
        const owner = memberByUser.get(project.ownerUserId);
        const open = [...blockers.values()].filter(
          (row) => row.projectId === project.id && row.status === "open",
        );
        const summary = summarizeOpenBlockers(open);
        cards.push({
          id: project.id,
          name: project.name,
          clientId: project.clientId,
          clientName: client?.name ?? "",
          ownerUserId: project.ownerUserId,
          ownerName: owner?.name ?? owner?.email ?? "",
          dueDate: project.dueDate ? new Date(project.dueDate) : null,
          priority: project.priority,
          status: project.status,
          currentStageKey: stage.key,
          currentStageLabel: stage.label,
          stageStatus: stage.status,
          openBlockerCount: summary.openBlockerCount,
          waitingOnClient: summary.waitingOnClient,
        });
      }
      return cards;
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
        for (const [checklistId, checklist] of checklists) {
          if (checklist.projectId === id) {
            for (const [itemId, item] of checklistItems) {
              if (item.checklistId === checklistId) {
                checklistItems.delete(itemId);
              }
            }
            checklists.delete(checklistId);
          }
        }
        for (const [approvalId, approval] of approvals) {
          if (approval.projectId === id) {
            approvals.delete(approvalId);
          }
        }
        for (const [blockerId, blocker] of blockers) {
          if (blocker.projectId === id) {
            blockers.delete(blockerId);
          }
        }
        for (const [validationId, validation] of validations) {
          if (validation.projectId === id) {
            validations.delete(validationId);
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
    async listChecklistTemplates(workspaceId) {
      ensureChecklistTemplate(workspaceId);
      return [...checklistTemplates.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .map(cloneChecklistTemplate);
    },
    async getChecklistTemplate(id) {
      const row = checklistTemplates.get(id);
      return row ? cloneChecklistTemplate(row) : null;
    },
    async updateChecklistTemplate(id, data: ChecklistTemplateUpdateInput) {
      const current = checklistTemplates.get(id);
      if (!current) {
        return null;
      }
      if (data.name !== undefined) current.name = data.name;
      if (data.description !== undefined) current.description = data.description;
      if (data.items) {
        for (const patch of data.items) {
          const item = current.items.find((entry) => entry.id === patch.id);
          if (item) item.title = patch.title;
        }
      }
      return cloneChecklistTemplate(current);
    },
    async applyChecklist(input) {
      const project = projects.get(input.projectId);
      if (!project || project.workspaceId !== input.workspaceId) {
        return null;
      }
      const template = checklistTemplates.get(input.templateId);
      if (!template || template.workspaceId !== input.workspaceId) {
        return null;
      }
      if (input.stageId) {
        const stage = stages.get(input.stageId);
        if (!stage || stage.projectId !== project.id) {
          return null;
        }
      }
      const copy = instantiateProjectChecklist({
        id: template.id,
        name: template.name,
        items: template.items.map((item) => ({ title: item.title, order: item.order })),
      });
      const checklistId = crypto.randomUUID();
      const row: ChecklistRow = {
        id: checklistId,
        workspaceId: input.workspaceId,
        projectId: project.id,
        stageId: input.stageId,
        templateId: template.id,
        name: copy.name,
        validationId: copy.validationId,
        createdAt: input.now,
        updatedAt: input.now,
      };
      checklists.set(checklistId, row);
      for (const item of copy.items) {
        const itemId = crypto.randomUUID();
        checklistItems.set(itemId, {
          id: itemId,
          checklistId,
          title: item.title,
          order: item.order,
          completedAt: null,
          completedByUserId: null,
          note: null,
        });
      }
      return toChecklistRecord(row);
    },
    async listProjectChecklists(projectId) {
      return [...checklists.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toChecklistRecord);
    },
    async listWorkspaceChecklists(workspaceId) {
      return [...checklists.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toChecklistRecord);
    },
    async getChecklistItem(id) {
      const row = checklistItems.get(id);
      return row ? toItemLookup(row) : null;
    },
    async updateChecklistItem(id, data) {
      const current = checklistItems.get(id);
      if (!current) {
        return null;
      }
      checklistItems.set(id, {
        ...current,
        completedAt: data.completedAt,
        completedByUserId: data.completedByUserId,
        note: data.note,
      });
      const updated = checklistItems.get(id);
      return updated ? toItemLookup(updated) : null;
    },
    async getProjectChecklist(id) {
      const row = checklists.get(id);
      return row ? toChecklistRecord(row) : null;
    },
    async setChecklistValidationId(id, validationId) {
      const current = checklists.get(id);
      if (!current) {
        return null;
      }
      current.validationId = validationId;
      current.updatedAt = new Date();
      return toChecklistRecord(current);
    },
    async listValidations(workspaceId, filters: ValidationFilters) {
      return [...validations.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => matchesValidationFilters(row, projects.get(row.projectId), filters))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toValidationRecord)
        .filter((row): row is ValidationRecord => row !== null);
    },
    async listProjectValidations(projectId) {
      return [...validations.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toValidationRecord)
        .filter((row): row is ValidationRecord => row !== null);
    },
    async getValidation(id) {
      const row = validations.get(id);
      return row ? toValidationRecord(row) : null;
    },
    async createValidation(data: ValidationCreateInput) {
      const project = projects.get(data.projectId);
      if (!project || project.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.stageId) {
        const stage = stages.get(data.stageId);
        if (!stage || stage.projectId !== project.id) {
          return null;
        }
      }
      if (data.checklistId) {
        const checklist = checklists.get(data.checklistId);
        if (!checklist || checklist.projectId !== project.id) {
          return null;
        }
      }
      const id = crypto.randomUUID();
      const row: ValidationRow = {
        id,
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        stageId: data.stageId,
        type: data.type,
        reviewerUserId: data.reviewerUserId,
        requesterUserId: data.requesterUserId,
        environment: data.environment,
        status: "draft",
        requestedAt: null,
        dueDate: data.dueDate,
        notes: data.notes,
        items: [...data.items],
        resultNotes: null,
        checklistId: data.checklistId,
        createdAt: data.now,
        updatedAt: data.now,
      };
      validations.set(id, row);
      if (data.checklistId) {
        const checklist = checklists.get(data.checklistId);
        if (checklist) {
          checklist.validationId = id;
          checklist.updatedAt = data.now;
        }
      }
      return toValidationRecord(row);
    },
    async updateValidation(id, data: ValidationUpdateInput) {
      const current = validations.get(id);
      if (!current) {
        return null;
      }
      if (data.stageId) {
        const stage = stages.get(data.stageId);
        if (!stage || stage.projectId !== current.projectId) {
          return null;
        }
      }
      if (data.checklistId) {
        const checklist = checklists.get(data.checklistId);
        if (!checklist || checklist.projectId !== current.projectId) {
          return null;
        }
      }
      const previousChecklistId = current.checklistId;
      const next: ValidationRow = {
        ...current,
        type: data.type ?? current.type,
        reviewerUserId: data.reviewerUserId !== undefined ? data.reviewerUserId : current.reviewerUserId,
        environment: data.environment !== undefined ? data.environment : current.environment,
        dueDate: data.dueDate !== undefined ? data.dueDate : current.dueDate,
        notes: data.notes !== undefined ? data.notes : current.notes,
        items: data.items !== undefined ? [...data.items] : current.items,
        resultNotes: data.resultNotes !== undefined ? data.resultNotes : current.resultNotes,
        stageId: data.stageId !== undefined ? data.stageId : current.stageId,
        checklistId: data.checklistId !== undefined ? data.checklistId : current.checklistId,
        updatedAt: new Date(),
      };
      validations.set(id, next);
      if (data.checklistId !== undefined && data.checklistId !== previousChecklistId) {
        if (previousChecklistId) {
          const previous = checklists.get(previousChecklistId);
          if (previous && previous.validationId === id) {
            previous.validationId = null;
          }
        }
        if (data.checklistId) {
          const checklist = checklists.get(data.checklistId);
          if (checklist) {
            checklist.validationId = id;
            checklist.updatedAt = next.updatedAt;
          }
        }
      }
      return toValidationRecord(next);
    },
    async persistValidationTransition(input) {
      const current = validations.get(input.id);
      if (!current) {
        return null;
      }
      current.status = input.status;
      current.requestedAt = input.requestedAt;
      if (input.resultNotes !== undefined) {
        current.resultNotes = input.resultNotes;
      }
      current.updatedAt = new Date();
      return toValidationRecord(current);
    },
    async listApprovals(workspaceId, filters: ApprovalFilters) {
      return [...approvals.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => matchesApprovalFilters(row, projects.get(row.projectId), filters))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toApprovalRecord)
        .filter((row): row is ApprovalRecord => row !== null);
    },
    async listProjectApprovals(projectId) {
      return [...approvals.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toApprovalRecord)
        .filter((row): row is ApprovalRecord => row !== null);
    },
    async getApproval(id) {
      const row = approvals.get(id);
      return row ? toApprovalRecord(row) : null;
    },
    async createApproval(data: ApprovalCreateInput) {
      const project = projects.get(data.projectId);
      if (!project || project.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.validationId) {
        const validation = validations.get(data.validationId);
        if (!validation || validation.projectId !== project.id) {
          return null;
        }
      }
      const id = crypto.randomUUID();
      const row: ApprovalRow = {
        id,
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        subjectType: "project",
        subjectId: data.projectId,
        kind: data.kind,
        status: "pending",
        validationId: data.validationId,
        approverId: null,
        decidedAt: null,
        revokedAt: null,
        comment: data.comment,
        projectSnapshot: { ...data.projectSnapshot },
        createdAt: data.now,
        updatedAt: data.now,
      };
      approvals.set(id, row);
      return toApprovalRecord(row);
    },
    async persistApprovalDecision(input) {
      const current = approvals.get(input.id);
      if (!current) {
        return null;
      }
      current.status = input.status;
      current.approverId = input.approverId;
      current.decidedAt = input.decidedAt;
      current.revokedAt = input.revokedAt;
      current.comment = input.comment;
      current.updatedAt = new Date();
      return toApprovalRecord(current);
    },
    async listBlockers(workspaceId, filters: BlockerFilters) {
      return [...blockers.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => matchesBlockerFilters(row, projects.get(row.projectId), filters))
        .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
        .map(toBlockerRecord)
        .filter((row): row is BlockerRecord => row !== null);
    },
    async listProjectBlockers(projectId) {
      return [...blockers.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
        .map(toBlockerRecord)
        .filter((row): row is BlockerRecord => row !== null);
    },
    async getBlocker(id) {
      const row = blockers.get(id);
      return row ? toBlockerRecord(row) : null;
    },
    async createBlocker(data: BlockerCreateInput) {
      const project = projects.get(data.projectId);
      if (!project || project.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.blocksStageId) {
        const stage = stages.get(data.blocksStageId);
        if (!stage || stage.projectId !== project.id) {
          return null;
        }
      }
      const id = crypto.randomUUID();
      const row: BlockerRow = {
        id,
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        title: data.title,
        assigneeKind: data.assigneeKind,
        assigneeUserId: data.assigneeUserId,
        blocksStageId: data.blocksStageId,
        blocksProject: data.blocksProject,
        status: "open",
        dueDate: data.dueDate,
        openedAt: data.now,
        resolvedAt: null,
        cancelledAt: null,
        sourceMeetingId: data.sourceMeetingId,
        notes: data.notes,
        createdAt: data.now,
        updatedAt: data.now,
      };
      blockers.set(id, row);
      return toBlockerRecord(row);
    },
    async persistBlockerDecision(input) {
      const current = blockers.get(input.id);
      if (!current) {
        return null;
      }
      current.status = input.status;
      current.resolvedAt = input.resolvedAt;
      current.cancelledAt = input.cancelledAt;
      current.notes = input.notes;
      current.updatedAt = new Date();
      return toBlockerRecord(current);
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
