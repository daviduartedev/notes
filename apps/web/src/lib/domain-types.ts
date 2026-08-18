export type ClientStatus = "lead" | "active" | "inactive" | "archived";
export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type StagePhase = "commercial" | "design" | "development";
export type StageStatus =
  | "pending"
  | "in_progress"
  | "waiting"
  | "blocked"
  | "completed"
  | "skipped";
export type StageAction = "complete" | "block" | "unblock" | "wait";

export type MemberDto = {
  id: string;
  name: string | null;
  email: string;
};

export type ClientDto = {
  id: string;
  workspaceId: string;
  name: string;
  company: string | null;
  whatsapp: string | null;
  email: string | null;
  ownerUserId: string;
  notes: string | null;
  status: ClientStatus;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StageActionDto = {
  action: StageAction;
  toKey: string | null;
  enabled: boolean;
  reason: string | null;
};

export type StageDto = {
  id: string;
  key: string;
  label: string;
  phase: StagePhase;
  order: number;
  allowedNextKeys: string[];
  entryCriteria: string;
  exitCriteria: string;
  status: StageStatus;
  isCurrent: boolean;
  startedAt: string | null;
  completedAt: string | null;
  actions: StageActionDto[];
};

export type ProjectDto = {
  id: string;
  workspaceId: string;
  clientId: string;
  clientName: string;
  name: string;
  description: string | null;
  ownerUserId: string;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  priority: ProjectPriority;
  progress: number;
  notes: string | null;
  visualState: "overdue" | null;
  workflowTemplateId?: string | null;
  currentStageId?: string | null;
  currentStageKey?: string | null;
  stages?: StageDto[];
  createdAt: string;
  updatedAt: string;
};

export type ActivityDto = {
  id: string;
  workspaceId: string;
  actorId: string;
  entityType: "client" | "project";
  entityId: string;
  action:
    | "client.created"
    | "client.updated"
    | "project.created"
    | "project.updated"
    | "project.status_changed"
    | "stage.started"
    | "stage.transitioned"
    | "stage.completed";
  payload: Record<string, unknown>;
  createdAt: string;
};
