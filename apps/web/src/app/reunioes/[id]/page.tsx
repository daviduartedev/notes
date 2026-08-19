import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { MeetingDto } from "@/lib/domain-types";
import { meetingTypeLabel } from "@/lib/labels";
import {
  MEETING_NOT_FOUND,
  meetingClientHref,
  meetingProjectHref,
} from "@/lib/meeting-copy";
import { serverApi } from "@/lib/server-api";
import { meetingTypeTone } from "@/lib/status-tone";

export default async function ReuniaoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await serverApi<MeetingDto>(`/api/meetings/${id}`);
  const meeting = detail.status === 200 ? detail.data : null;

  return (
    <AppShell title="Reunião" pathname="/reunioes">
      {!meeting ? (
        <p className="text-sm text-semantic-red">{MEETING_NOT_FOUND}</p>
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusPill tone={meetingTypeTone[meeting.type]}>
              {meetingTypeLabel[meeting.type]}
            </StatusPill>
            <h3 className="font-display text-xl">{meeting.title}</h3>
          </div>
          <p className="mb-4 text-sm text-notes-muted">
            {meeting.projectId ? (
              <a href={meetingProjectHref(meeting.projectId)}>{meeting.projectName}</a>
            ) : (
              meeting.projectName ?? "Sem projeto"
            )}
            {" · "}
            {meeting.clientId ? (
              <a href={meetingClientHref(meeting.clientId)}>{meeting.clientName}</a>
            ) : (
              meeting.clientName ?? "Sem cliente"
            )}
          </p>
          <p className="mb-2 text-sm">
            {new Date(meeting.startsAt).toLocaleString("pt-BR")}
          </p>
          <p className="mb-4 text-sm text-notes-muted">
            Participantes:{" "}
            {meeting.participants.length === 0
              ? "nenhum"
              : meeting.participants.map((item) => item.name ?? item.userId).join(", ")}
          </p>
          {meeting.notes ? (
            <p className="mb-2 text-sm">
              <span className="text-notes-muted">Notas:</span> {meeting.notes}
            </p>
          ) : null}
          {meeting.decisions ? (
            <p className="mb-2 text-sm">
              <span className="text-notes-muted">Decisões:</span> {meeting.decisions}
            </p>
          ) : null}
          {meeting.nextSteps ? (
            <p className="mb-2 text-sm">
              <span className="text-notes-muted">Próximos passos:</span> {meeting.nextSteps}
            </p>
          ) : null}
        </Card>
      )}
    </AppShell>
  );
}
