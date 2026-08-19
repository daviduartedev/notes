export const REMINDERS_EMPTY = "Nenhum lembrete ainda.";
export const REMINDERS_LOAD_ERROR = "Não foi possível carregar os lembretes.";
export const REMINDERS_LOADING = "Carregando lembretes…";
export const REMINDER_NOT_FOUND = "Lembrete não encontrado";
export const REMINDER_COPY_LABEL = "Copiar mensagem";
export const REMINDER_COPIED = "Mensagem copiada";

export function reminderHref(id: string): string {
  return `/lembretes/${id}`;
}

export function reminderProjectHref(projectId: string): string {
  return `/projetos/${projectId}`;
}
