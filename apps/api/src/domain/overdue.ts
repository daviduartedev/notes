import type { ProjectStatus } from "./types.js";
import {
  isTerminalValidationStatus,
  type ValidationStatus,
} from "./validation-status.js";

export type ProjectVisualState = "overdue";
export type ValidationVisualState = "overdue";

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

export function validationVisualState(
  status: ValidationStatus,
  dueDate: Date | null,
  now: Date,
): ValidationVisualState | null {
  if (isTerminalValidationStatus(status)) {
    return null;
  }
  if (dueDate !== null && dueDate.getTime() < now.getTime()) {
    return "overdue";
  }
  return null;
}
