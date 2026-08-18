import type { ClientStatus, ProjectPriority, ProjectStatus } from "./domain-types";

export const clientStatusLabel: Record<ClientStatus, string> = {
  lead: "Lead",
  active: "Ativo",
  inactive: "Inativo",
  archived: "Arquivado",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  on_hold: "Em espera",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const projectPriorityLabel: Record<ProjectPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};
