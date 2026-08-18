export type ClientStatus = "lead" | "active" | "inactive" | "archived";
export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";

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
    | "project.status_changed";
  payload: Record<string, unknown>;
  createdAt: string;
};
