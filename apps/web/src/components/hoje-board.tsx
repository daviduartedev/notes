import { Card } from "@/components/ui/card";
import type { HojeCardDto, HojeDashboardDto } from "@/lib/domain-types";
import {
  HOJE_SECTION_EMPTY,
  HOJE_SECTION_LABELS,
  HOJE_SECTION_ORDER,
  type HojeSectionKey,
} from "@/lib/hoje-copy";

function formatSince(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function HojePostIt({ card }: { card: HojeCardDto }) {
  return (
    <a href={card.href} className="block">
      <Card className="flex rotate-[-0.4deg] flex-col gap-2 p-3 shadow-[2px_3px_0_rgba(0,0,0,0.25)] hover:bg-notes-raised">
        <p className="text-xs text-notes-muted">{card.clientName}</p>
        <p className="font-medium">{card.projectName}</p>
        <p className="text-sm">{card.reason}</p>
        <p className="text-xs text-notes-muted">Desde {formatSince(card.since)}</p>
        <p className="text-sm text-semantic-blue">{card.nextAction} →</p>
      </Card>
    </a>
  );
}

function SectionColumn({
  sectionKey,
  cards,
}: {
  sectionKey: HojeSectionKey;
  cards: HojeCardDto[];
}) {
  return (
    <section className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-notes-border bg-notes-panel p-3">
      <h3 className="font-display text-xl">{HOJE_SECTION_LABELS[sectionKey]}</h3>
      {cards.length === 0 ? (
        <p className="text-sm text-notes-muted">{HOJE_SECTION_EMPTY[sectionKey]}</p>
      ) : (
        cards.map((card) => <HojePostIt key={card.id} card={card} />)
      )}
    </section>
  );
}

export function HojeBoard({ board }: { board: HojeDashboardDto }) {
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <div className="flex min-w-min items-stretch gap-2 pb-4">
        {HOJE_SECTION_ORDER.map((sectionKey, index) => (
          <div key={sectionKey} className="flex items-stretch gap-2">
            {index > 0 ? (
              <div
                aria-hidden="true"
                className="mt-8 hidden w-4 shrink-0 text-center font-display text-2xl text-notes-muted md:block"
              >
                →
              </div>
            ) : null}
            <SectionColumn sectionKey={sectionKey} cards={board[sectionKey]} />
          </div>
        ))}
      </div>
    </div>
  );
}
