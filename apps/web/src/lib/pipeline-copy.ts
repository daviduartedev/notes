export const PIPELINE_EMPTY = "Nenhum projeto no quadro.";
export const PIPELINE_LOAD_ERROR = "Não foi possível carregar o pipeline.";
export const PIPELINE_LOADING = "Carregando quadro…";

export function pipelineCardHref(projectId: string): string {
  return `/projetos/${projectId}`;
}

export function formatPipelineDueDate(iso: string | null): string {
  if (!iso) {
    return "Sem prazo";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
