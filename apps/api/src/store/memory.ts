import { instantiateProjectChecklist } from "../domain/checklist-instance.js";
import {
  DEPLOY_STAGING_ITEMS,
  DEPLOY_STAGING_TEMPLATE_DESCRIPTION,
  DEPLOY_STAGING_TEMPLATE_KEY,
  DEPLOY_STAGING_TEMPLATE_NAME,
} from "../domain/deploy-staging-template.js";
import { PIPELINE_BOARD_STATUSES, type PipelineCardRow } from "../domain/pipeline-board.js";
import { instantiateProjectStages } from "../domain/stage-instance.js";
import { isCatalogWorkflowKey, WORKFLOW_CATALOG } from "../domain/workflow-catalog.js";
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
  ReminderChannel,
  ReminderStatus,
  ReminderSubjectType,
} from "../domain/reminder-status.js";
import type { MeetingType } from "../domain/meeting-type.js";
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
  FollowUpCandidate,
  MemberRecord,
  NotesStore,
  PipelineFilters,
  ProjectChecklistRecord,
  ProjectCreateInput,
  ProjectFilters,
  ProjectRecord,
  ProjectUpdateInput,
  ReminderCreateInput,
  ReminderFilters,
  ReminderRecord,
  MeetingCreateInput,
  MeetingFilters,
  MeetingRecord,
  MeetingUpdateInput,
  WorkflowTemplateCreateInput,
  WorkflowTemplateDeleteResult,
  WorkflowTemplateRecord,
  WorkflowTemplateUpdateInput,
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

type ReminderRow = {
  id: string;
  workspaceId: string;
  subjectType: ReminderSubjectType;
  subjectId: string;
  clientId: string;
  projectId: string | null;
  channel: ReminderChannel;
  policyKey: string | null;
  status: ReminderStatus;
  dueAt: Date;
  snoozedUntil: Date | null;
  doneAt: Date | null;
  cancelledAt: Date | null;
  draftMessage: string;
  createdAt: Date;
  updatedAt: Date;
};

type MeetingRow = {
  id: string;
  workspaceId: string;
  title: string;
  type: MeetingType;
  startsAt: Date;
  participantUserIds: string[];
  notes: string | null;
  decisions: string | null;
  nextSteps: string | null;
  clientId: string | null;
  projectId: string | null;
  stageId: string | null;
  validationId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type TemplateRow = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    lastInteractionAt: row.lastInteractionAt ? new Date(row.lastInteractionAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function cloneProject(row: ProjectRecord): ProjectRecord {
  return {
    ...row,
    startDate: row.startDate ? new Date(row.startDate) : null,
    dueDate: row.dueDate ? new Date(row.dueDate) : null,
    lastInteractionAt: row.lastInteractionAt ? new Date(row.lastInteractionAt) : null,
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

function cloneWorkflowTemplate(row: TemplateRow): WorkflowTemplateRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    key: row.key,
    name: row.name,
    isDefault: row.isDefault,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    stages: row.stages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        id: stage.id,
        key: stage.key,
        label: stage.label,
        phase: stage.phase,
        order: stage.order,
        allowedNextKeys: [...stage.allowedNextKeys],
        entryCriteria: stage.entryCriteria,
        exitCriteria: stage.exitCriteria,
      })),
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

function matchesReminderFilters(row: ReminderRow, filters: ReminderFilters): boolean {
  if (filters.status && row.status !== filters.status) return false;
  if (filters.projectId && row.projectId !== filters.projectId) return false;
  if (filters.clientId && row.clientId !== filters.clientId) return false;
  return true;
}

function matchesMeetingFilters(row: MeetingRow, filters: MeetingFilters): boolean {
  if (filters.type && row.type !== filters.type) return false;
  if (filters.projectId && row.projectId !== filters.projectId) return false;
  if (filters.clientId && row.clientId !== filters.clientId) return false;
  if (filters.validationId && row.validationId !== filters.validationId) return false;
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
  const reminders = new Map<string, ReminderRow>();
  const meetings = new Map<string, MeetingRow>();
  const activities: ActivityRecord[] = [];

  function ensureCatalog(workspaceId: string): TemplateRow[] {
    const now = new Date();
    const seeded: TemplateRow[] = [];
    for (const item of WORKFLOW_CATALOG) {
      const existing = [...templates.values()].find(
        (row) => row.workspaceId === workspaceId && row.key === item.key,
      );
      if (existing) {
        seeded.push(existing);
        continue;
      }
      const templateId = crypto.randomUUID();
      const row: TemplateRow = {
        id: templateId,
        workspaceId,
        key: item.key,
        name: item.name,
        isDefault: item.isDefault,
        createdAt: now,
        updatedAt: now,
        stages: item.stages.map((stage) => ({
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
      seeded.push(row);
    }
    return seeded;
  }

  function setDefaultTemplate(workspaceId: string, templateId: string) {
    for (const row of templates.values()) {
      if (row.workspaceId !== workspaceId) continue;
      row.isDefault = row.id === templateId;
      row.updatedAt = new Date();
    }
  }

  function templateOf(id: string): TemplateRow | undefined {
    return templates.get(id);
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

  function toReminderRecord(row: ReminderRow): ReminderRecord | null {
    const client = clients.get(row.clientId);
    const project = row.projectId ? projects.get(row.projectId) : null;
    if (!client) return null;
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      clientId: row.clientId,
      clientName: client.name,
      projectId: row.projectId,
      projectName: project?.name ?? null,
      channel: row.channel,
      policyKey: row.policyKey,
      status: row.status,
      dueAt: new Date(row.dueAt),
      snoozedUntil: row.snoozedUntil ? new Date(row.snoozedUntil) : null,
      doneAt: row.doneAt ? new Date(row.doneAt) : null,
      cancelledAt: row.cancelledAt ? new Date(row.cancelledAt) : null,
      draftMessage: row.draftMessage,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  function toMeetingRecord(row: MeetingRow): MeetingRecord | null {
    const client = row.clientId ? clients.get(row.clientId) : null;
    const project = row.projectId ? projects.get(row.projectId) : null;
    if (row.clientId && !client) return null;
    if (row.projectId && !project) return null;
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      title: row.title,
      type: row.type,
      startsAt: new Date(row.startsAt),
      participantUserIds: [...row.participantUserIds],
      notes: row.notes,
      decisions: row.decisions,
      nextSteps: row.nextSteps,
      clientId: row.clientId,
      clientName: client?.name ?? null,
      projectId: row.projectId,
      projectName: project?.name ?? null,
      stageId: row.stageId,
      validationId: row.validationId,
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

  function copyStagesOntoProject(
    project: ProjectRecord,
    now: Date,
    workflowTemplateId: string,
  ): StageRecord[] {
    ensureCatalog(project.workspaceId);
    const template = templateOf(workflowTemplateId);
    if (!template || template.workspaceId !== project.workspaceId) {
      throw new Error("template inválido");
    }
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

  function defaultTemplateId(workspaceId: string): string {
    const seeded = ensureCatalog(workspaceId);
    const preferred = seeded.find((row) => row.isDefault) ?? seeded.find((row) => row.key === "saas_delivery");
    if (!preferred) {
      throw new Error("catálogo vazio");
    }
    return preferred.id;
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
        lastInteractionAt: data.lastInteractionAt ?? null,
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
        lastInteractionAt: data.lastInteractionAt ?? null,
        id: crypto.randomUUID(),
        workflowTemplateId: data.workflowTemplateId,
        currentStageId: null,
        createdAt: now,
        updatedAt: now,
      };
      projects.set(row.id, row);
      copyStagesOntoProject(row, now, data.workflowTemplateId);
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
        for (const [reminderId, reminder] of reminders) {
          if (reminder.projectId === id) {
            reminders.delete(reminderId);
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
      return copyStagesOntoProject(
        project,
        now,
        project.workflowTemplateId ?? defaultTemplateId(project.workspaceId),
      );
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
    async listWorkflowTemplates(workspaceId) {
      ensureCatalog(workspaceId);
      return [...templates.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .map(cloneWorkflowTemplate);
    },
    async getWorkflowTemplate(id) {
      const row = templates.get(id);
      return row ? cloneWorkflowTemplate(row) : null;
    },
    async createWorkflowTemplate(data: WorkflowTemplateCreateInput) {
      ensureCatalog(data.workspaceId);
      const duplicate = [...templates.values()].some(
        (row) => row.workspaceId === data.workspaceId && row.key === data.key,
      );
      if (duplicate) {
        return null;
      }
      const now = new Date();
      const row: TemplateRow = {
        id: crypto.randomUUID(),
        workspaceId: data.workspaceId,
        key: data.key,
        name: data.name,
        isDefault: data.isDefault,
        createdAt: now,
        updatedAt: now,
        stages: data.stages.map((stage) => ({
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
      templates.set(row.id, row);
      if (data.isDefault) {
        setDefaultTemplate(data.workspaceId, row.id);
      }
      return cloneWorkflowTemplate(row);
    },
    async updateWorkflowTemplate(id, data: WorkflowTemplateUpdateInput) {
      const current = templates.get(id);
      if (!current) {
        return null;
      }
      if (data.name !== undefined) current.name = data.name;
      if (data.stages) {
        current.stages = data.stages.map((stage) => ({
          id: crypto.randomUUID(),
          key: stage.key,
          label: stage.label,
          phase: stage.phase,
          order: stage.order,
          allowedNextKeys: [...stage.allowedNextKeys],
          entryCriteria: stage.entryCriteria,
          exitCriteria: stage.exitCriteria,
        }));
      }
      current.updatedAt = new Date();
      if (data.isDefault === true) {
        setDefaultTemplate(current.workspaceId, current.id);
      } else if (data.isDefault === false) {
        current.isDefault = false;
      }
      return cloneWorkflowTemplate(current);
    },
    async deleteWorkflowTemplate(id): Promise<WorkflowTemplateDeleteResult> {
      const current = templates.get(id);
      if (!current) {
        return "not_found";
      }
      if (isCatalogWorkflowKey(current.key)) {
        return "catalog";
      }
      const inUse = [...projects.values()].some((project) => project.workflowTemplateId === id);
      if (inUse) {
        return "in_use";
      }
      templates.delete(id);
      return "deleted";
    },
    async backfillMissingStages(workspaceId, now) {
      let count = 0;
      for (const project of projects.values()) {
        if (project.workspaceId !== workspaceId) continue;
        if (stagesOf(project.id).length > 0) continue;
        copyStagesOntoProject(
          project,
          now,
          project.workflowTemplateId ?? defaultTemplateId(project.workspaceId),
        );
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
    async touchLastInteraction(input) {
      if (input.entityType === "client") {
        const client = clients.get(input.entityId);
        if (!client) return;
        client.lastInteractionAt = input.now;
        client.updatedAt = input.now;
        return;
      }
      const project = projects.get(input.entityId);
      if (!project) return;
      project.lastInteractionAt = input.now;
      project.updatedAt = input.now;
      const client = clients.get(project.clientId);
      if (client) {
        client.lastInteractionAt = input.now;
        client.updatedAt = input.now;
      }
    },
    async listFollowUpCandidates(workspaceId) {
      const rows: FollowUpCandidate[] = [];
      for (const project of projects.values()) {
        if (project.workspaceId !== workspaceId) continue;
        const client = clients.get(project.clientId);
        const stage = project.currentStageId ? stages.get(project.currentStageId) : null;
        rows.push({
          id: project.id,
          workspaceId: project.workspaceId,
          clientId: project.clientId,
          name: project.name,
          clientName: client?.name ?? "",
          currentStageKey: stage?.key ?? null,
          lastInteractionAt: project.lastInteractionAt,
          createdAt: project.createdAt,
        });
      }
      return rows;
    },
    async listReminders(workspaceId, filters: ReminderFilters) {
      return [...reminders.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => matchesReminderFilters(row, filters))
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
        .map(toReminderRecord)
        .filter((row): row is ReminderRecord => row !== null);
    },
    async listProjectReminders(projectId) {
      return [...reminders.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
        .map(toReminderRecord)
        .filter((row): row is ReminderRecord => row !== null);
    },
    async getReminder(id) {
      const row = reminders.get(id);
      return row ? toReminderRecord(row) : null;
    },
    async createReminder(data: ReminderCreateInput) {
      const client = clients.get(data.clientId);
      if (!client || client.workspaceId !== data.workspaceId) {
        return null;
      }
      if (data.projectId) {
        const project = projects.get(data.projectId);
        if (!project || project.workspaceId !== data.workspaceId) {
          return null;
        }
        if (project.clientId !== data.clientId) {
          return null;
        }
      }
      const id = crypto.randomUUID();
      const row: ReminderRow = {
        id,
        workspaceId: data.workspaceId,
        subjectType: data.subjectType,
        subjectId: data.subjectId,
        clientId: data.clientId,
        projectId: data.projectId,
        channel: data.channel,
        policyKey: data.policyKey,
        status: data.status,
        dueAt: data.dueAt,
        snoozedUntil: null,
        doneAt: null,
        cancelledAt: null,
        draftMessage: data.draftMessage,
        createdAt: data.now,
        updatedAt: data.now,
      };
      reminders.set(id, row);
      return toReminderRecord(row);
    },
    async persistReminderDecision(input) {
      const current = reminders.get(input.id);
      if (!current) {
        return null;
      }
      current.status = input.status;
      current.dueAt = input.dueAt;
      current.doneAt = input.doneAt;
      current.cancelledAt = input.cancelledAt;
      current.snoozedUntil = input.snoozedUntil;
      current.updatedAt = new Date();
      return toReminderRecord(current);
    },
    async promoteDueReminders(workspaceId, now) {
      let count = 0;
      for (const row of reminders.values()) {
        if (row.workspaceId !== workspaceId || row.status !== "scheduled") continue;
        if (row.dueAt.getTime() > now.getTime()) continue;
        row.status = "due";
        row.updatedAt = now;
        count += 1;
      }
      return count;
    },
    async listMeetings(workspaceId, filters: MeetingFilters) {
      return [...meetings.values()]
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => matchesMeetingFilters(row, filters))
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
        .map(toMeetingRecord)
        .filter((row): row is MeetingRecord => row !== null);
    },
    async listProjectMeetings(projectId) {
      return [...meetings.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
        .map(toMeetingRecord)
        .filter((row): row is MeetingRecord => row !== null);
    },
    async listClientMeetings(clientId) {
      return [...meetings.values()]
        .filter((row) => row.clientId === clientId)
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
        .map(toMeetingRecord)
        .filter((row): row is MeetingRecord => row !== null);
    },
    async getMeeting(id) {
      const row = meetings.get(id);
      return row ? toMeetingRecord(row) : null;
    },
    async createMeeting(data: MeetingCreateInput) {
      if (data.clientId) {
        const client = clients.get(data.clientId);
        if (!client || client.workspaceId !== data.workspaceId) {
          return null;
        }
      }
      if (data.projectId) {
        const project = projects.get(data.projectId);
        if (!project || project.workspaceId !== data.workspaceId) {
          return null;
        }
      }
      const id = crypto.randomUUID();
      const row: MeetingRow = {
        id,
        workspaceId: data.workspaceId,
        title: data.title,
        type: data.type,
        startsAt: data.startsAt,
        participantUserIds: [...data.participantUserIds],
        notes: data.notes,
        decisions: data.decisions,
        nextSteps: data.nextSteps,
        clientId: data.clientId,
        projectId: data.projectId,
        stageId: data.stageId,
        validationId: data.validationId,
        createdAt: data.now,
        updatedAt: data.now,
      };
      meetings.set(id, row);
      return toMeetingRecord(row);
    },
    async updateMeeting(id, data: MeetingUpdateInput) {
      const current = meetings.get(id);
      if (!current) {
        return null;
      }
      if (data.title !== undefined) current.title = data.title;
      if (data.type !== undefined) current.type = data.type;
      if (data.startsAt !== undefined) current.startsAt = data.startsAt;
      if (data.participantUserIds !== undefined) {
        current.participantUserIds = [...data.participantUserIds];
      }
      if (data.notes !== undefined) current.notes = data.notes;
      if (data.decisions !== undefined) current.decisions = data.decisions;
      if (data.nextSteps !== undefined) current.nextSteps = data.nextSteps;
      current.updatedAt = new Date();
      return toMeetingRecord(current);
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
