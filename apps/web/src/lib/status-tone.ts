import type { StatusTone } from "@/components/ui/status-pill";
import type { ClientStatus, ProjectStatus, StageStatus, ValidationStatus } from "@/lib/domain-types";

export const clientStatusTone: Record<ClientStatus, StatusTone> = {
  lead: "blue",
  active: "green",
  inactive: "yellow",
  archived: "purple",
};

export const projectStatusTone: Record<ProjectStatus, StatusTone> = {
  draft: "blue",
  active: "green",
  on_hold: "yellow",
  completed: "purple",
  cancelled: "red",
};

export const stageStatusTone: Record<StageStatus, StatusTone> = {
  pending: "blue",
  in_progress: "green",
  waiting: "yellow",
  blocked: "red",
  completed: "purple",
  skipped: "yellow",
};

export const validationStatusTone: Record<ValidationStatus, StatusTone> = {
  draft: "purple",
  requested: "purple",
  in_review: "purple",
  changes_requested: "purple",
  approved: "purple",
  rejected: "purple",
  cancelled: "purple",
};
