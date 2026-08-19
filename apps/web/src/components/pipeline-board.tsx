import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { PipelineBoardDto, PipelineCardDto } from "@/lib/domain-types";
import { formatPipelineDueDate, PIPELINE_EMPTY, pipelineCardHref } from "@/lib/pipeline-copy";

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
  return pills;
}

export function PipelineBoard({ board }: { board: PipelineBoardDto }) {
  const total = board.columns.reduce((sum, column) => sum + column.projects.length, 0);
  return (
    <div className="flex flex-col gap-4">
      {total === 0 ? <p className="text-sm text-notes-muted">{PIPELINE_EMPTY}</p> : null}
      <div className="-mx-6 overflow-x-auto px-6">
        <div className="flex min-w-min gap-4 pb-4">
          {board.columns.map((column) => (
            <section
              key={column.key}
              className="flex w-64 shrink-0 flex-col gap-3 rounded-lg border border-notes-border bg-notes-panel p-3"
            >
              <h3 className="font-display text-xl">{column.label}</h3>
              {column.projects.map((card) => (
                <a key={card.id} href={pipelineCardHref(card.id)} className="block">
                  <Card className="flex flex-col gap-2 p-3 hover:bg-notes-raised">
                    <p className="text-xs text-notes-muted">{card.clientName}</p>
                    <p className="font-medium">{card.name}</p>
                    <p className="text-sm text-notes-muted">{card.ownerName}</p>
                    <p className="text-sm text-notes-muted">{formatPipelineDueDate(card.dueDate)}</p>
                    <div className="flex flex-wrap gap-1">
                      {cardPills(card).map((pill) => (
                        <StatusPill key={pill.label} tone={pill.tone}>
                          {pill.label}
                        </StatusPill>
                      ))}
                    </div>
                  </Card>
                </a>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
