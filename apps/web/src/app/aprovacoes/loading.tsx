import { AppShell } from "@/components/app-shell";
import { APPROVALS_LOADING } from "@/lib/approval-copy";

export default function AprovacoesLoading() {
  return (
    <AppShell title="Aprovações" pathname="/aprovacoes">
      <p className="text-sm text-notes-muted">{APPROVALS_LOADING}</p>
    </AppShell>
  );
}
