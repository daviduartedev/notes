export const CHECKLISTS_EMPTY = "Nenhum checklist aplicado.";
export const CHECKLISTS_LOAD_ERROR = "Não foi possível carregar os checklists.";
export const CHECKLISTS_LOADING = "Carregando checklists…";
export const CHECKLIST_APPLY_LABEL = "Aplicar template";
export const CHECKLIST_MARK_LABEL = "Marcar item";

export function checklistProjectHref(projectId: string): string {
  return `/projetos/${projectId}`;
}

export function formatChecklistCompletedAt(iso: string | null): string {
  if (!iso) {
    return "Aberto";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}
