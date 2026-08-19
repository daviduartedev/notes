import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ValidationActions } from "@/components/validation-actions";
import type { ValidationDto } from "@/lib/domain-types";
import { validationStatusLabel, validationTypeLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { validationStatusTone } from "@/lib/status-tone";
import { VALIDATION_NOT_FOUND, validationProjectHref } from "@/lib/validation-copy";

export default async function ValidacaoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await serverApi<ValidationDto>(`/api/validations/${id}`);
  const validation = detail.status === 200 ? detail.data : null;

  return (
    <AppShell title="Validação" pathname="/validacoes">
      {!validation ? (
        <p className="text-sm text-semantic-red">{VALIDATION_NOT_FOUND}</p>
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {validation.visualState === "overdue" ? (
              <StatusPill tone="red">Atrasada</StatusPill>
            ) : null}
            <StatusPill tone={validationStatusTone[validation.status]}>
              {validationStatusLabel[validation.status]}
            </StatusPill>
            <StatusPill tone="purple">{validationTypeLabel[validation.type]}</StatusPill>
          </div>
          <p className="mb-2 text-sm text-notes-muted">
            <a href={validationProjectHref(validation.projectId)}>{validation.projectName}</a>
            {" · "}
            {validation.clientName}
          </p>
          {validation.notes ? <p className="mb-4 text-sm">{validation.notes}</p> : null}
          <ValidationActions validation={validation} />
        </Card>
      )}
    </AppShell>
  );
}
