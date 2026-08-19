export const APPROVALS_EMPTY = "Nenhuma aprovação ainda.";
export const APPROVALS_LOAD_ERROR = "Não foi possível carregar as aprovações.";
export const APPROVALS_LOADING = "Carregando aprovações…";
export const APPROVAL_CREATE_LABEL = "Solicitar aprovação";
export const APPROVAL_NOT_FOUND = "Aprovação não encontrada";

export function approvalHref(id: string): string {
  return `/aprovacoes/${id}`;
}

export function approvalProjectHref(projectId: string): string {
  return `/projetos/${projectId}`;
}
