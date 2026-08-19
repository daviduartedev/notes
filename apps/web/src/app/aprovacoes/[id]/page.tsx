import { ApprovalActions } from "@/components/approval-actions";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { APPROVAL_NOT_FOUND, approvalProjectHref } from "@/lib/approval-copy";
import type { ApprovalDto } from "@/lib/domain-types";
import { approvalKindLabel, approvalStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { approvalStatusTone } from "@/lib/status-tone";

export default async function AprovacaoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await serverApi<ApprovalDto>(`/api/approvals/${id}`);
  const approval = detail.status === 200 ? detail.data : null;

  return (
    <AppShell title="Aprovação" pathname="/aprovacoes">
      {!approval ? (
        <p className="text-sm text-semantic-red">{APPROVAL_NOT_FOUND}</p>
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusPill tone={approvalStatusTone[approval.status]}>
              {approvalStatusLabel[approval.status]}
            </StatusPill>
            <StatusPill tone="green">{approvalKindLabel[approval.kind]}</StatusPill>
          </div>
          <p className="mb-2 text-sm text-notes-muted">
            <a href={approvalProjectHref(approval.projectId)}>{approval.projectName}</a>
            {" · "}
            {approval.clientName}
          </p>
          {approval.comment ? <p className="mb-4 text-sm">{approval.comment}</p> : null}
          <pre className="mb-4 overflow-x-auto text-xs text-notes-muted">
            {JSON.stringify(approval.projectSnapshot, null, 2)}
          </pre>
          <ApprovalActions approval={approval} />
        </Card>
      )}
    </AppShell>
  );
}
