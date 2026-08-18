export function publicErrorMessage(status: number): string {
  if (status === 400) return "Dados inválidos";
  if (status === 401) return "Não autenticado";
  if (status === 403) return "Sem permissão";
  if (status === 404) return "Não encontrado";
  return "Erro interno";
}

export function clientErrorBody(message: string): { error: string } {
  return { error: message };
}
