import { Bell } from "lucide-react";
import { AttentionLeadForm } from "@/components/attention-lead-form";
import type { HojeCardDto, HojeDashboardDto, WorkspaceDto } from "@/lib/domain-types";
import {
  HOJE_SECTION_EMPTY,
  HOJE_SECTION_LABELS,
  HOJE_SECTION_ORDER,
  type HojeSectionKey,
} from "@/lib/hoje-copy";

const COLUMN_ACCENT: Record<HojeSectionKey, string> = {
  needs_attention: "bg-semantic-red",
  today: "bg-notes-muted",
  waiting_client: "bg-notes-ink",
  in_progress: "bg-notes-muted",
};

function formatSince(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function HojeCard({ card }: { card: HojeCardDto }) {
  return (
    <a
      href={card.href}
      className="block border border-notes-border bg-notes-raised p-3.5 transition-colors hover:bg-notes-panel"
      style={{ borderLeftWidth: 2, borderLeftColor: card.alert ? "#5b8cff" : "rgba(255,255,255,0.12)" }}
    >
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-notes-muted">
        {card.alert ? <Bell className="size-3.5 shrink-0 text-notes-ink" aria-hidden="true" /> : null}
        {card.clientName}
      </p>
      <p className="mt-1 text-[13px] font-medium leading-snug">{card.projectName}</p>
      <p className="mt-1 text-[12px] text-notes-muted">{card.reason}</p>
      <p className="mt-3 text-[11px] text-notes-muted">Desde {formatSince(card.since)}</p>
      <p className="mt-1 text-[12px] text-notes-ink">{card.nextAction}</p>
    </a>
  );
}

function SectionColumn({
  sectionKey,
  cards,
  leadForm,
}: {
  sectionKey: HojeSectionKey;
  cards: HojeCardDto[];
  leadForm?: WorkspaceDto;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <div className="mb-4 flex h-6 items-center gap-2 overflow-hidden">
        <span className={`h-3 w-0.5 shrink-0 ${COLUMN_ACCENT[sectionKey]}`} />
        <h3 className="truncate text-[13px] font-medium">{HOJE_SECTION_LABELS[sectionKey]}</h3>
        {cards.length > 0 ? (
          <span className="shrink-0 text-[11px] tabular-nums text-notes-muted">{cards.length}</span>
        ) : null}
      </div>
      {sectionKey === "needs_attention" && leadForm ? (
        <div className="mb-4 min-w-0">
          <AttentionLeadForm workspace={leadForm} />
        </div>
      ) : null}
      {cards.length === 0 ? (
        <p className="text-[12px] text-notes-muted">{HOJE_SECTION_EMPTY[sectionKey]}</p>
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {cards.map((card) => (
            <HojeCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}

export function HojeBoard({
  board,
  workspace,
}: {
  board: HojeDashboardDto;
  workspace: WorkspaceDto | null;
}) {
  return (
    <div className="board-bg flex-1 overflow-x-auto">
      <div className="grid min-w-[56rem] grid-cols-4 gap-6 px-8 py-6">
        {HOJE_SECTION_ORDER.map((sectionKey) => (
          <SectionColumn
            key={sectionKey}
            sectionKey={sectionKey}
            cards={board[sectionKey]}
            leadForm={sectionKey === "needs_attention" ? workspace ?? undefined : undefined}
          />
        ))}
      </div>
    </div>
  );
}
