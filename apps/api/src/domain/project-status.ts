import type { ProjectStatus } from "./types.js";

const TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  draft: ["active", "cancelled"],
  active: ["on_hold", "completed", "cancelled"],
  on_hold: ["active", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionProjectStatus(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return TRANSITIONS[from].includes(to);
}
