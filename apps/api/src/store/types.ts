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
};
