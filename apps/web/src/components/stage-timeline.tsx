import type { ReactNode } from "react";
import type { TimelineNodeState } from "@/lib/stage-timeline";

const NODE: Record<TimelineNodeState, string> = {
  completed: "bg-notes-ink",
  current: "border-2 border-notes-ink bg-notes-canvas",
  upcoming: "border border-notes-border bg-transparent",
  blocked: "bg-semantic-red",
  waiting: "border-2 border-semantic-yellow bg-transparent",
  skipped: "border border-notes-border bg-notes-raised opacity-40",
  idle: "border border-notes-muted/50 bg-transparent",
};

export function StageNode({ state }: { state: TimelineNodeState }) {
  return (
    <span
      className={`relative z-[1] mt-1.5 size-2.5 shrink-0 ${NODE[state]}`}
      data-state={state}
      aria-hidden
    />
  );
}

export function StageTimeline({ children }: { children: ReactNode }) {
  return <ol className="m-0 flex list-none flex-col p-0">{children}</ol>;
}

export function StageTimelineItem({
  state,
  last = false,
  compact = false,
  current = false,
  children,
}: {
  state: TimelineNodeState;
  last?: boolean;
  compact?: boolean;
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4" aria-current={current ? "step" : undefined}>
      <div className="flex w-5 shrink-0 flex-col items-center self-stretch">
        <StageNode state={state} />
        {last ? null : <span className="w-px flex-1 bg-notes-border" aria-hidden />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "pb-0" : compact ? "pb-5" : "pb-8"}`}>{children}</div>
    </li>
  );
}

export function StageTimelinePhase({
  label,
  last = false,
}: {
  label: string;
  last?: boolean;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex w-5 shrink-0 flex-col items-center self-stretch">
        <span className="mt-2 size-1.5 shrink-0 bg-notes-muted" aria-hidden />
        {last ? null : <span className="w-px flex-1 bg-notes-border" aria-hidden />}
      </div>
      <p className={`pt-0.5 text-[11px] font-medium uppercase tracking-widest text-notes-muted ${last ? "pb-0" : "pb-3"}`}>
        {label}
      </p>
    </li>
  );
}
