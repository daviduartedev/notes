import type { PipelineCardRow } from "../domain/pipeline-board.js";
import type {
  ApprovalKind,
  ApprovalSnapshot,
  ApprovalStatus,
} from "../domain/approval-status.js";
import type {
  ValidationStatus,
  ValidationType,
} from "../domain/validation-status.js";
import type {
  ActivityAction,
  ClientStatus,
  EntityType,
  ProjectPriority,
  ProjectStatus,
  StagePhase,
  StageStatus,
} from "../domain/types.js";

export type MemberRecord = {
  userId: string;
  workspaceId: string;
  name: string | null;
  email: string;
};

export type ClientRecord = {
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
};

export type ClientFilters = {
  name?: string;
  ownerUserId?: string;
  status?: ClientStatus;
};

export type ClientCreateInput = Omit<ClientRecord, "id" | "createdAt" | "updatedAt">;
export type ClientUpdateInput = Partial<Omit<ClientRecord, "id" | "workspaceId" | "createdAt">>;

export type ProjectRecord = {
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
};

export type ProjectFilters = {
  ownerUserId?: string;
  status?: ProjectStatus;
  clientId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  priority?: ProjectPriority;
};

export type PipelineFilters = {
  ownerUserId?: string;
  clientId?: string;
  priority?: ProjectPriority;
};

export type ProjectCreateInput = Omit<
  ProjectRecord,
  "id" | "createdAt" | "updatedAt" | "workflowTemplateId" | "currentStageId"
>;
export type ProjectUpdateInput = Partial<Omit<ProjectRecord, "id" | "workspaceId" | "createdAt">>;

export type StageRecord = {
  id: string;
  workspaceId: string;
  projectId: string;
  stageTemplateId: string | null;
  key: string;
  label: string;
  phase: StagePhase;
  order: number;
  allowedNextKeys: string[];
  entryCriteria: string;
  exitCriteria: string;
  status: StageStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type StagePersistPatch = {
  id: string;
  status: StageStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
};

export type ActivityRecord = {
  id: string;
  workspaceId: string;
  actorId: string;
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  payload: Record<string, unknown>;
  createdAt: Date;
};

export type ActivityCreateInput = Omit<ActivityRecord, "id" | "createdAt">;

export type ChecklistTemplateItemRecord = {
  id: string;
  title: string;
  order: number;
};

export type ChecklistTemplateRecord = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string | null;
  items: ChecklistTemplateItemRecord[];
};

export type ChecklistItemRecord = {
  id: string;
  checklistId: string;
  title: string;
  order: number;
  completedAt: Date | null;
  completedByUserId: string | null;
  completedByName: string | null;
  note: string | null;
};

export type ProjectChecklistRecord = {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  stageId: string | null;
  templateId: string | null;
  name: string;
  validationId: string | null;
  items: ChecklistItemRecord[];
  createdAt: Date;
  updatedAt: Date;
};

export type ChecklistItemLookup = ChecklistItemRecord & {
  workspaceId: string;
  projectId: string;
};

export type ChecklistTemplateUpdateInput = {
  name?: string;
  description?: string | null;
  items?: Array<{ id: string; title: string }>;
};

export type ValidationRecord = {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  stageId: string | null;
  type: ValidationType;
  reviewerUserId: string | null;
  reviewerName: string | null;
  requesterUserId: string;
  requesterName: string | null;
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

export type ValidationFilters = {
  status?: ValidationStatus;
  projectId?: string;
  clientId?: string;
  reviewerUserId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
};

export type ValidationCreateInput = {
  workspaceId: string;
  projectId: string;
  stageId: string | null;
  type: ValidationType;
  reviewerUserId: string | null;
  requesterUserId: string;
  environment: string | null;
  dueDate: Date | null;
  notes: string | null;
  items: string[];
  checklistId: string | null;
  now: Date;
};

export type ApprovalRecord = {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  subjectType: "project";
  subjectId: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  validationId: string | null;
  approverId: string | null;
  approverName: string | null;
  decidedAt: Date | null;
  revokedAt: Date | null;
  comment: string | null;
  projectSnapshot: ApprovalSnapshot;
  createdAt: Date;
  updatedAt: Date;
};

export type ApprovalFilters = {
  status?: ApprovalStatus;
  kind?: ApprovalKind;
  projectId?: string;
  clientId?: string;
  approverId?: string;
};

export type ApprovalCreateInput = {
  workspaceId: string;
  projectId: string;
  kind: ApprovalKind;
  validationId: string | null;
  comment: string | null;
  projectSnapshot: ApprovalSnapshot;
  now: Date;
};

export type ValidationUpdateInput = {
  type?: ValidationType;
  reviewerUserId?: string | null;
  environment?: string | null;
  dueDate?: Date | null;
  notes?: string | null;
  items?: string[];
  resultNotes?: string | null;
  stageId?: string | null;
  checklistId?: string | null;
};

export type NotesStore = {
  listMembers(workspaceId: string): Promise<MemberRecord[]>;
  memberExists(workspaceId: string, userId: string): Promise<boolean>;
  listClients(workspaceId: string, filters: ClientFilters): Promise<ClientRecord[]>;
  getClient(id: string): Promise<ClientRecord | null>;
  createClient(data: ClientCreateInput): Promise<ClientRecord>;
  updateClient(id: string, data: ClientUpdateInput): Promise<ClientRecord | null>;
  countProjectsForClient(clientId: string): Promise<number>;
  deleteClient(id: string): Promise<boolean>;
  listProjects(workspaceId: string, filters: ProjectFilters): Promise<ProjectRecord[]>;
  listPipelineCards(workspaceId: string, filters: PipelineFilters): Promise<PipelineCardRow[]>;
  getProject(id: string): Promise<ProjectRecord | null>;
  createProject(data: ProjectCreateInput): Promise<ProjectRecord>;
  updateProject(id: string, data: ProjectUpdateInput): Promise<ProjectRecord | null>;
  deleteProject(id: string): Promise<boolean>;
  appendActivity(data: ActivityCreateInput): Promise<ActivityRecord>;
  listActivity(
    workspaceId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<ActivityRecord[]>;
  listClientHistory(workspaceId: string, clientId: string): Promise<ActivityRecord[]>;
  listStagesByProject(projectId: string): Promise<StageRecord[]>;
  getStage(id: string): Promise<StageRecord | null>;
  hydrateProjectStages(projectId: string, now: Date): Promise<StageRecord[]>;
  persistStageAction(input: {
    projectId: string;
    currentStageId: string;
    patches: StagePersistPatch[];
  }): Promise<void>;
  updateStageTemplateAllowedNextKeys(
    workflowTemplateId: string,
    key: string,
    allowedNextKeys: string[],
  ): Promise<boolean>;
  backfillMissingStages(workspaceId: string, now: Date): Promise<number>;
  listChecklistTemplates(workspaceId: string): Promise<ChecklistTemplateRecord[]>;
  getChecklistTemplate(id: string): Promise<ChecklistTemplateRecord | null>;
  updateChecklistTemplate(
    id: string,
    data: ChecklistTemplateUpdateInput,
  ): Promise<ChecklistTemplateRecord | null>;
  applyChecklist(input: {
    workspaceId: string;
    projectId: string;
    templateId: string;
    stageId: string | null;
    now: Date;
  }): Promise<ProjectChecklistRecord | null>;
  listProjectChecklists(projectId: string): Promise<ProjectChecklistRecord[]>;
  listWorkspaceChecklists(workspaceId: string): Promise<ProjectChecklistRecord[]>;
  getChecklistItem(id: string): Promise<ChecklistItemLookup | null>;
  updateChecklistItem(
    id: string,
    data: {
      completedAt: Date | null;
      completedByUserId: string | null;
      note: string | null;
    },
  ): Promise<ChecklistItemLookup | null>;
  getProjectChecklist(id: string): Promise<ProjectChecklistRecord | null>;
  setChecklistValidationId(
    id: string,
    validationId: string | null,
  ): Promise<ProjectChecklistRecord | null>;
  listValidations(workspaceId: string, filters: ValidationFilters): Promise<ValidationRecord[]>;
  listProjectValidations(projectId: string): Promise<ValidationRecord[]>;
  getValidation(id: string): Promise<ValidationRecord | null>;
  createValidation(data: ValidationCreateInput): Promise<ValidationRecord | null>;
  updateValidation(id: string, data: ValidationUpdateInput): Promise<ValidationRecord | null>;
  persistValidationTransition(input: {
    id: string;
    status: ValidationStatus;
    requestedAt: Date | null;
    resultNotes?: string | null;
  }): Promise<ValidationRecord | null>;
  listApprovals(workspaceId: string, filters: ApprovalFilters): Promise<ApprovalRecord[]>;
  listProjectApprovals(projectId: string): Promise<ApprovalRecord[]>;
  getApproval(id: string): Promise<ApprovalRecord | null>;
  createApproval(data: ApprovalCreateInput): Promise<ApprovalRecord | null>;
  persistApprovalDecision(input: {
    id: string;
    status: ApprovalStatus;
    approverId: string | null;
    decidedAt: Date | null;
    revokedAt: Date | null;
    comment: string | null;
  }): Promise<ApprovalRecord | null>;
};
