export const MEETINGS_EMPTY = "Nenhuma reunião ainda.";
export const MEETINGS_LOAD_ERROR = "Não foi possível carregar as reuniões.";
export const MEETINGS_LOADING = "Carregando reuniões…";
export const MEETING_NOT_FOUND = "Reunião não encontrada";
export const MEETING_CREATE_LABEL = "Registrar reunião";
export const MEETING_CREATE_ERROR = "Não foi possível registrar a reunião";

export function meetingHref(id: string): string {
  return `/reunioes/${id}`;
}

export function meetingProjectHref(projectId: string): string {
  return `/projetos/${projectId}`;
}

export function meetingClientHref(clientId: string): string {
  return `/clientes/${clientId}`;
}
