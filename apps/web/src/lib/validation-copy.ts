export const VALIDATIONS_EMPTY = "Nenhuma validação ainda.";
export const VALIDATIONS_LOAD_ERROR = "Não foi possível carregar as validações.";
export const VALIDATIONS_LOADING = "Carregando validações…";
export const VALIDATION_CREATE_LABEL = "Solicitar validação";
export const VALIDATION_SAVE_LABEL = "Salvar rascunho";
export const VALIDATION_NOT_FOUND = "Validação não encontrada";

export function validationHref(id: string): string {
  return `/validacoes/${id}`;
}

export function validationProjectHref(projectId: string): string {
  return `/projetos/${projectId}`;
}
