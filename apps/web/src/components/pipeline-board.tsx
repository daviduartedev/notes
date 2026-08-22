import { StatusPill } from "@/components/ui/status-pill";
import type { PipelineBoardDto, PipelineCardDto } from "@/lib/domain-types";
import { stagePhaseLabel } from "@/lib/labels";
import { formatPipelineDueDate, PIPELINE_EMPTY, pipelineCardHref } from "@/lib/pipeline-copy";

const PHASE_BY_KEY: Record<string, "commercial" | "design" | "development"> = {
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
    <a href={pipelineCardHref(card.id)} className="mb-2 block border border-notes-border bg-[#1a1a1a] p-3 hover:bg-notes-raised">
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

export function PipelineBoard({ board }: { board: PipelineBoardDto }) {
  const total = board.columns.reduce((sum, column) => sum + column.projects.length, 0);
  const phases = (["commercial", "design", "development"] as const).map((phase) => ({
    phase,
    columns: board.columns.filter((column) => PHASE_BY_KEY[column.key] === phase),
  })).filter((group) => group.columns.length > 0);
  const extra = board.columns.filter((column) => !PHASE_BY_KEY[column.key]);
  const groups = extra.length > 0
    ? [...phases, { phase: null, columns: extra }]
    : phases;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {total === 0 ? <p className="px-8 text-sm text-notes-muted">{PIPELINE_EMPTY}</p> : null}
      {groups.length > 0 ? (
        <div className="flex border-b border-notes-border">
          {groups.map((group) => (
            <div
              key={group.phase ?? "extra"}
              className="border-r border-notes-border px-4 py-2"
              style={{ flex: Math.max(group.columns.length, 1) }}
            >
              <span className="text-[11px] font-medium uppercase tracking-widest text-notes-muted">
                {group.phase ? stagePhaseLabel[group.phase] : "Outros"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex-1 overflow-x-auto">
        <div className="flex min-w-min">
          {board.columns.map((column) => (
            <section
              key={column.key}
              className="flex w-[200px] shrink-0 flex-col border-r border-notes-border"
            >
              <div className="flex items-center justify-between border-b border-notes-border px-3 py-3">
                <h3 className="text-[12px] font-medium text-notes-muted">{column.label}</h3>
                {column.projects.length > 0 ? (
                  <span className="text-[10px] tabular-nums text-notes-muted">{column.projects.length}</span>
                ) : null}
              </div>
              <div className="flex-1 p-3">
                {column.projects.length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-notes-muted">—</p>
                ) : (
                  column.projects.map((card) => <PipelineCard key={card.id} card={card} />)
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
