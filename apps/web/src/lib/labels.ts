import type {
  ClientStatus,
  ProjectPriority,
  ProjectStatus,
  StageAction,
  StagePhase,
  StageStatus,
  ValidationStatus,
  ValidationType,
  ApprovalStatus,
  ApprovalKind,
  ApprovalAction,
  BlockerStatus,
  BlockerAssigneeKind,
  BlockerAction,
  ReminderStatus,
  ReminderAction,
  MeetingType,
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

export const validationStatusLabel: Record<ValidationStatus, string> = {
  draft: "Rascunho",
  requested: "Solicitada",
  in_review: "Em revisão",
  changes_requested: "Ajustes solicitados",
  approved: "Aprovada",
  rejected: "Recusada",
  cancelled: "Cancelada",
};

export const validationTypeLabel: Record<ValidationType, string> = {
  prototype: "Protótipo",
  staging: "Staging",
  production: "Produção",
  feature: "Funcionalidade",
  delivery: "Entrega",
};

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
  pending: "Pendente",
  granted: "Concedida",
  rejected: "Recusada",
  cancelled: "Cancelada",
  revoked: "Revogada",
};

export const approvalKindLabel: Record<ApprovalKind, string> = {
  proposal: "Proposta",
  scope: "Escopo",
  prototype: "Protótipo",
  staging: "Staging",
  production: "Produção",
  final_acceptance: "Aceite final",
};

export const approvalActionLabel: Record<ApprovalAction, string> = {
  grant: "Conceder",
  reject: "Recusar",
  cancel: "Cancelar",
  revoke: "Revogar",
};

export const blockerStatusLabel: Record<BlockerStatus, string> = {
  open: "Aberta",
  resolved: "Resolvida",
  cancelled: "Cancelada",
};

export const blockerAssigneeKindLabel: Record<BlockerAssigneeKind, string> = {
  internal: "Interno",
  client: "Cliente",
};

export const blockerActionLabel: Record<BlockerAction, string> = {
  resolve: "Resolver",
  cancel: "Cancelar",
};

export const reminderStatusLabel: Record<ReminderStatus, string> = {
  scheduled: "Agendado",
  due: "Vencido",
  done: "Enviado",
  snoozed: "Adiado",
  cancelled: "Cancelado",
};

export const reminderActionLabel: Record<ReminderAction, string> = {
  complete: "Marcar enviado",
  snooze: "Adiar",
  cancel: "Cancelar",
};

export const meetingTypeLabel: Record<MeetingType, string> = {
  kickoff: "Kickoff",
  scope_alignment: "Alinhamento de escopo",
  prototype_review: "Revisão de protótipo",
  staging_validation: "Validação staging",
  production_validation: "Validação produção",
  delivery: "Entrega",
};

export const WAITING_ON_CLIENT_COPY = "Aguardando cliente";

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
