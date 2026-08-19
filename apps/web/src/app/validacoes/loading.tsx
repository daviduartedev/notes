import { AppShell } from "@/components/app-shell";
import { VALIDATIONS_LOADING } from "@/lib/validation-copy";

export default function ValidacoesLoading() {
  return (
    <AppShell title="Validações" pathname="/validacoes">
      <p className="text-sm text-notes-muted">{VALIDATIONS_LOADING}</p>
    </AppShell>
  );
}
