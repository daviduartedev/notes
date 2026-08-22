import type { StagePhase, StageStatus } from "./domain-types";
import { stagePhaseLabel } from "./labels";

export type TimelineNodeState =
  | "completed"
  | "current"
  | "upcoming"
  | "blocked"
  | "waiting"
  | "skipped"
  | "idle";

export function timelineNodeState(input: {
  status?: StageStatus | null;
  isCurrent?: boolean;
  hasWork?: boolean;
}): TimelineNodeState {
  if (input.status === "blocked") return "blocked";
  if (input.status === "waiting") return "waiting";
  if (input.status === "skipped") return "skipped";
  if (input.status === "completed") return "completed";
  if (input.isCurrent || input.status === "in_progress") return "current";
  if (input.hasWork) return "current";
  if (!input.status) return "idle";
  return "upcoming";
}

export type TimelinePhaseGroup<T> = {
  phase: StagePhase | null;
  label: string;
  items: T[];
};

export function groupByPhase<T>(
  items: T[],
  phaseOf: (item: T) => StagePhase | null,
): TimelinePhaseGroup<T>[] {
  const groups: TimelinePhaseGroup<T>[] = [];
  for (const item of items) {
    const phase = phaseOf(item);
    const last = groups[groups.length - 1];
    if (last && last.phase === phase) {
      last.items.push(item);
      continue;
    }
    groups.push({
      phase,
      label: phase ? stagePhaseLabel[phase] : "Outros",
      items: [item],
    });
  }
  return groups;
}
