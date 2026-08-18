import type {
  ClientStatus,
  ProjectPriority,
  ProjectStatus,
  StageAction,
  StagePhase,
  StageStatus,
} from "./domain-types";

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

export const stagePhaseLabel: Record<StagePhase, string> = {
  commercial: "Comercial",
  design: "Design",
  development: "Desenvolvimento",
};

export const stageStatusLabel: Record<StageStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  waiting: "Aguardando",
  blocked: "Bloqueada",
  completed: "Concluída",
  skipped: "Pulada",
};

export const stageActionLabel: Record<StageAction, string> = {
  complete: "Avançar",
  block: "Bloquear",
  unblock: "Desbloquear",
  wait: "Aguardar",
};

export const stageKeyLabel: Record<string, string> = {
  briefing: "Briefing",
  proposal: "Proposta",
  waiting_client: "Aguardando cliente",
  kickoff: "Kickoff",
  ux: "UX",
  prototype: "Protótipo",
  design_handoff: "Handoff design",
  development: "Desenvolvimento",
  staging: "Staging",
  production: "Produção",
};
