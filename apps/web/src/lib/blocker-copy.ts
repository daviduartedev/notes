export const BLOCKERS_EMPTY = "Nenhuma pendência ainda.";
export const BLOCKERS_LOAD_ERROR = "Não foi possível carregar as pendências.";
export const BLOCKERS_LOADING = "Carregando pendências…";
export const BLOCKER_CREATE_LABEL = "Abrir pendência";
export const BLOCKER_NOT_FOUND = "Pendência não encontrada";
export const WAITING_ON_CLIENT_COPY = "Aguardando cliente";

export function blockerHref(id: string): string {
  return `/pendencias/${id}`;
}

export function blockerProjectHref(projectId: string): string {
  return `/projetos/${projectId}`;
}
