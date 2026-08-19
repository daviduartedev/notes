import { AppShell } from "@/components/app-shell";
import { BlockerActions } from "@/components/blocker-actions";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { BLOCKER_NOT_FOUND, WAITING_ON_CLIENT_COPY, blockerProjectHref } from "@/lib/blocker-copy";
import type { BlockerDto } from "@/lib/domain-types";
import { blockerAssigneeKindLabel, blockerStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { blockerStatusTone } from "@/lib/status-tone";

export default async function PendenciaFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await serverApi<BlockerDto>(`/api/blockers/${id}`);
  const blocker = detail.status === 200 ? detail.data : null;

  return (
    <AppShell title="Pendência" pathname="/pendencias">
      {!blocker ? (
        <p className="text-sm text-semantic-red">{BLOCKER_NOT_FOUND}</p>
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusPill tone={blockerStatusTone[blocker.status]}>
              {blockerStatusLabel[blocker.status]}
            </StatusPill>
            {blocker.waitingOnClient ? (
              <StatusPill tone="yellow">{WAITING_ON_CLIENT_COPY}</StatusPill>
            ) : (
              <StatusPill tone="blue">{blockerAssigneeKindLabel[blocker.assigneeKind]}</StatusPill>
            )}
            {blocker.visualState === "overdue" ? <StatusPill tone="red">Atrasada</StatusPill> : null}
          </div>
          <h3 className="mb-2 font-display text-xl">{blocker.title}</h3>
          <p className="mb-2 text-sm text-notes-muted">
            <a href={blockerProjectHref(blocker.projectId)}>{blocker.projectName}</a>
            {" · "}
            {blocker.clientName}
          </p>
          {blocker.notes ? <p className="mb-4 text-sm">{blocker.notes}</p> : null}
          <BlockerActions blocker={blocker} />
        </Card>
      )}
    </AppShell>
  );
}
