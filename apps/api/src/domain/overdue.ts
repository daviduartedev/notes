import type { ProjectStatus } from "./types.js";

export type ProjectVisualState = "overdue";

export function projectVisualState(
  status: ProjectStatus,
  dueDate: Date | null,
  now: Date,
): ProjectVisualState | null {
  if (status === "active" && dueDate !== null && dueDate.getTime() < now.getTime()) {
    return "overdue";
  }
  return null;
}
