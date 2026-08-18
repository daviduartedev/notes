import type { StatusTone } from "@/components/ui/status-pill";
import type { ClientStatus, ProjectStatus } from "@/lib/domain-types";

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
