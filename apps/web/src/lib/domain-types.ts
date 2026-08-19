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
export type ValidationStatus =
  | "draft"
  | "requested"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "cancelled";
export type ValidationType = "prototype" | "staging" | "production" | "feature" | "delivery";
export type ApprovalStatus = "pending" | "granted" | "rejected" | "cancelled" | "revoked";
export type ApprovalKind =
  | "proposal"
  | "scope"
  | "prototype"
  | "staging"
  | "production"
  | "final_acceptance";
export type ApprovalAction = "grant" | "reject" | "cancel" | "revoke";
export type BlockerStatus = "open" | "resolved" | "cancelled";
export type BlockerAssigneeKind = "internal" | "client";
export type BlockerAction = "resolve" | "cancel";
export type ReminderStatus = "scheduled" | "due" | "done" | "snoozed" | "cancelled";
export type ReminderAction = "complete" | "snooze" | "cancel";
export type ReminderChannel = "internal";
export type ReminderSubjectType = "project" | "client";

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
  lastInteractionAt?: string | null;
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
  openBlockerCount?: number;
  waitingOnClient?: boolean;
  lastInteractionAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PipelineCardDto = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  ownerUserId: string;
  ownerName: string;
  dueDate: string | null;
  priority: ProjectPriority;
  status: ProjectStatus;
  currentStageKey: string;
  currentStageLabel: string;
  stageStatus: StageStatus;
  visualState: "overdue" | null;
  openBlockerCount: number;
  waitingOnClient: boolean;
};

export type PipelineColumnDto = {
  key: string;
  label: string;
  order: number;
  projects: PipelineCardDto[];
};

export type PipelineBoardDto = {
  columns: PipelineColumnDto[];
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
    | "stage.completed"
    | "checklist.applied"
    | "checklist.item_completed"
    | "validation.requested"
    | "validation.in_review"
    | "validation.changes_requested"
    | "validation.approved"
    | "validation.rejected"
    | "approval.granted"
    | "approval.rejected"
    | "approval.revoked"
    | "blocker.opened"
    | "blocker.resolved"
    | "reminder.created"
    | "reminder.completed";
  payload: Record<string, unknown>;
  createdAt: string;
};

export type ChecklistTemplateItemDto = {
  id: string;
  title: string;
  order: number;
};

export type ChecklistTemplateDto = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string | null;
  items: ChecklistTemplateItemDto[];
};

export type ChecklistItemDto = {
  id: string;
  checklistId: string;
  title: string;
  order: number;
  completedAt: string | null;
  completedByUserId: string | null;
  completedByName: string | null;
  note: string | null;
};

export type ProjectChecklistDto = {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  stageId: string | null;
  templateId: string | null;
  name: string;
  validationId: string | null;
  items: ChecklistItemDto[];
  createdAt: string;
  updatedAt: string;
};

export type ValidationDto = {
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
  requestedAt: string | null;
  dueDate: string | null;
  notes: string | null;
  items: string[];
  resultNotes: string | null;
  checklistId: string | null;
  visualState: "overdue" | null;
  allowedTransitions: ValidationStatus[];
  createdAt: string;
  updatedAt: string;
};

export type ApprovalSnapshotDto = {
  currentStageKey: string | null;
  projectStatus: ProjectStatus;
  validationId: string | null;
  projectId: string;
  clientId: string;
};

export type ApprovalDto = {
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
  decidedAt: string | null;
  revokedAt: string | null;
  comment: string | null;
  projectSnapshot: ApprovalSnapshotDto;
  allowedActions: ApprovalAction[];
  createdAt: string;
  updatedAt: string;
};

export type BlockerDto = {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  title: string;
  assigneeKind: BlockerAssigneeKind;
  assigneeUserId: string | null;
  assigneeName: string | null;
  waitingOnClient: boolean;
  waitingOnClientCopy: string | null;
  blocksStageId: string | null;
  blocksProject: boolean;
  status: BlockerStatus;
  dueDate: string | null;
  openedAt: string;
  resolvedAt: string | null;
  cancelledAt: string | null;
  sourceMeetingId: string | null;
  notes: string | null;
  visualState: "overdue" | null;
  allowedActions: BlockerAction[];
  createdAt: string;
  updatedAt: string;
};

export type ReminderDto = {
  id: string;
  workspaceId: string;
  subjectType: ReminderSubjectType;
  subjectId: string;
  clientId: string;
  clientName: string;
  projectId: string | null;
  projectName: string | null;
  channel: ReminderChannel;
  policyKey: string | null;
  status: ReminderStatus;
  dueAt: string;
  snoozedUntil: string | null;
  doneAt: string | null;
  cancelledAt: string | null;
  draftMessage: string;
  visualState: "overdue" | null;
  allowedActions: ReminderAction[];
  createdAt: string;
  updatedAt: string;
};
