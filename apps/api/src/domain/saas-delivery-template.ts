import type { StagePhase } from "./types.js";

export const SAAS_DELIVERY_KEY = "saas_delivery";
export const SAAS_DELIVERY_NAME = "SaaS delivery";

export type StageTemplateSnapshot = {
  key: string;
  label: string;
  phase: StagePhase;
  order: number;
  allowedNextKeys: readonly string[];
  entryCriteria: string;
  exitCriteria: string;
};

export type WorkflowTemplateSnapshot = {
  key: typeof SAAS_DELIVERY_KEY;
  name: typeof SAAS_DELIVERY_NAME;
  stages: readonly StageTemplateSnapshot[];
};

export const SAAS_DELIVERY_STAGES: readonly StageTemplateSnapshot[] = [
  {
    order: 1,
    key: "briefing",
    label: "Briefing",
    phase: "commercial",
    allowedNextKeys: ["proposal"],
    entryCriteria: "Pedido comercial recebido",
    exitCriteria: "Escopo inicial alinhado",
  },
  {
    order: 2,
    key: "proposal",
    label: "Proposta",
    phase: "commercial",
    allowedNextKeys: ["waiting_client"],
    entryCriteria: "Briefing concluído",
    exitCriteria: "Proposta enviada ao cliente",
  },
  {
    order: 3,
    key: "waiting_client",
    label: "Aguardando cliente",
    phase: "commercial",
    allowedNextKeys: ["kickoff"],
    entryCriteria: "Proposta enviada",
    exitCriteria: "Cliente respondeu à proposta",
  },
  {
    order: 4,
    key: "kickoff",
    label: "Kickoff",
    phase: "commercial",
    allowedNextKeys: ["ux"],
    entryCriteria: "Cliente alinhado",
    exitCriteria: "Kickoff realizado",
  },
  {
    order: 5,
    key: "ux",
    label: "UX",
    phase: "design",
    allowedNextKeys: ["prototype"],
    entryCriteria: "Kickoff realizado",
    exitCriteria: "Fluxos de UX definidos",
  },
  {
    order: 6,
    key: "prototype",
    label: "Protótipo",
    phase: "design",
    allowedNextKeys: ["design_handoff"],
    entryCriteria: "UX definido",
    exitCriteria: "Protótipo navegável pronto",
  },
  {
    order: 7,
    key: "design_handoff",
    label: "Handoff design",
    phase: "design",
    allowedNextKeys: ["development"],
    entryCriteria: "Protótipo pronto",
    exitCriteria: "Handoff para desenvolvimento",
  },
  {
    order: 8,
    key: "development",
    label: "Desenvolvimento",
    phase: "development",
    allowedNextKeys: ["staging"],
    entryCriteria: "Handoff recebido",
    exitCriteria: "Build de staging disponível",
  },
  {
    order: 9,
    key: "staging",
    label: "Staging",
    phase: "development",
    allowedNextKeys: ["production"],
    entryCriteria: "Desenvolvimento entregue",
    exitCriteria: "Staging validado",
  },
  {
    order: 10,
    key: "production",
    label: "Produção",
    phase: "development",
    allowedNextKeys: [],
    entryCriteria: "Staging validado",
    exitCriteria: "Publicado em produção",
  },
];

export const SAAS_DELIVERY_TEMPLATE: WorkflowTemplateSnapshot = {
  key: SAAS_DELIVERY_KEY,
  name: SAAS_DELIVERY_NAME,
  stages: SAAS_DELIVERY_STAGES,
};

export const STAGE_PHASE_LABEL: Record<StagePhase, string> = {
  commercial: "Comercial",
  design: "Design",
  development: "Desenvolvimento",
};
