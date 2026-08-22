import { Fragment } from "react";
import { StageTimeline, StageTimelineItem, StageTimelinePhase } from "@/components/stage-timeline";
import { StatusPill } from "@/components/ui/status-pill";
import type { PipelineBoardDto, PipelineCardDto, PipelineColumnDto, StagePhase, StageStatus } from "@/lib/domain-types";
import { formatPipelineDueDate, PIPELINE_EMPTY, pipelineCardHref } from "@/lib/pipeline-copy";
import { groupByPhase, timelineNodeState } from "@/lib/stage-timeline";

const PHASE_BY_KEY: Record<string, StagePhase> = {
  briefing: "commercial",
  proposal: "commercial",
  waiting_client: "commercial",
  kickoff: "commercial",
  ux: "design",
  prototype: "design",
  design_handoff: "design",
  development: "development",
  staging: "development",
  production: "development",
};

function columnNodeState(projects: PipelineCardDto[]) {
  const statuses = projects.map((card) => card.stageStatus);
  const pick = (status: StageStatus) => statuses.includes(status);
  if (pick("blocked")) return timelineNodeState({ status: "blocked" });
  if (pick("waiting") || projects.some((card) => card.waitingOnClient)) {
    return timelineNodeState({ status: "waiting" });
  }
  return timelineNodeState({ hasWork: projects.length > 0 });
}

function cardPills(card: PipelineCardDto) {
  const pills: Array<{ tone: "red" | "yellow"; label: string }> = [];
  if (card.visualState === "overdue") {
    pills.push({ tone: "red", label: "Atrasado" });
  }
  if (card.stageStatus === "blocked") {
    pills.push({ tone: "red", label: "Bloqueada" });
  }
  if (card.stageStatus === "waiting") {
    pills.push({ tone: "yellow", label: "Aguardando" });
  }
  if (card.openBlockerCount > 0) {
    pills.push({ tone: "red", label: "Pendência" });
  }
  if (card.waitingOnClient) {
    pills.push({ tone: "yellow", label: "Aguardando cliente" });
  }
  return pills;
}

function PipelineCard({ card }: { card: PipelineCardDto }) {
  return (
    <a
      href={pipelineCardHref(card.id)}
      className="block border border-notes-border bg-[#1a1a1a] p-3 hover:bg-notes-raised"
    >
      <p className="text-[13px] font-medium leading-snug">{card.name}</p>
      <p className="mt-1 text-[11px] text-notes-muted">{card.clientName}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {cardPills(card).map((pill) => (
          <StatusPill key={pill.label} tone={pill.tone}>
            {pill.label}
          </StatusPill>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-notes-muted">
        <span>{card.ownerName}</span>
        <span>{formatPipelineDueDate(card.dueDate)}</span>
      </div>
    </a>
  );
}

function ColumnBody({ column }: { column: PipelineColumnDto }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium">{column.label}</h3>
        {column.projects.length > 0 ? (
          <span className="text-[11px] tabular-nums text-notes-muted">{column.projects.length}</span>
        ) : null}
      </div>
      {column.projects.length === 0 ? (
        <p className="text-[12px] text-notes-muted">Nenhum projeto nesta etapa.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {column.projects.map((card) => (
            <PipelineCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PipelineBoard({ board }: { board: PipelineBoardDto }) {
  const columns = [...board.columns].sort((a, b) => a.order - b.order);
  const total = columns.reduce((sum, column) => sum + column.projects.length, 0);
  const groups = groupByPhase(columns, (column) => PHASE_BY_KEY[column.key] ?? null);

  return (
    <div className="flex flex-col gap-4">
      {total === 0 ? <p className="text-sm text-notes-muted">{PIPELINE_EMPTY}</p> : null}
      {groups.length === 0 ? null : (
        <StageTimeline>
          {groups.map((group, groupIndex) => (
            <Fragment key={group.phase ?? `extra-${group.label}`}>
              <StageTimelinePhase label={group.label} />
              {group.items.map((column, itemIndex) => {
                const last = groupIndex === groups.length - 1 && itemIndex === group.items.length - 1;
                return (
                  <StageTimelineItem
                    key={column.key}
                    state={columnNodeState(column.projects)}
                    last={last}
                    compact
                    current={column.projects.length > 0}
                  >
                    <ColumnBody column={column} />
                  </StageTimelineItem>
                );
              })}
            </Fragment>
          ))}
        </StageTimeline>
      )}
    </div>
  );
}
