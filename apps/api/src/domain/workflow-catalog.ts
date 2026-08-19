import {
  SAAS_DELIVERY_KEY,
  SAAS_DELIVERY_NAME,
  SAAS_DELIVERY_STAGES,
  type StageTemplateSnapshot,
} from "./saas-delivery-template.js";
import type { StagePhase } from "./types.js";

export type CatalogWorkflow = {
  key: string;
  name: string;
  isDefault: boolean;
  stages: readonly StageTemplateSnapshot[];
};

function linear(
  rows: Array<{
    key: string;
    label: string;
    phase: StagePhase;
    entryCriteria: string;
    exitCriteria: string;
  }>,
): StageTemplateSnapshot[] {
  return rows.map((row, index) => {
    const next = rows[index + 1];
    return {
      order: index + 1,
      key: row.key,
      label: row.label,
      phase: row.phase,
      allowedNextKeys: next ? [next.key] : [],
      entryCriteria: row.entryCriteria,
      exitCriteria: row.exitCriteria,
    };
  });
}

export const LANDING_STAGES: readonly StageTemplateSnapshot[] = linear([
  {
    key: "briefing",
    label: "Briefing",
    phase: "commercial",
    entryCriteria: "Pedido comercial recebido",
    exitCriteria: "Escopo da landing alinhado",
  },
  {
    key: "design",
    label: "Design",
    phase: "design",
    entryCriteria: "Briefing concluído",
    exitCriteria: "Layout aprovado internamente",
  },
  {
    key: "development",
    label: "Desenvolvimento",
    phase: "development",
    entryCriteria: "Design entregue",
    exitCriteria: "Landing implementada",
  },
  {
    key: "publication",
    label: "Publicação",
    phase: "development",
    entryCriteria: "Desenvolvimento concluído",
    exitCriteria: "Página publicada",
  },
]);

export const INSTITUTIONAL_STAGES: readonly StageTemplateSnapshot[] = linear([
  {
    key: "briefing",
    label: "Briefing",
    phase: "commercial",
    entryCriteria: "Pedido comercial recebido",
    exitCriteria: "Escopo institucional alinhado",
  },
  {
    key: "content",
    label: "Conteúdo",
    phase: "commercial",
    entryCriteria: "Briefing concluído",
    exitCriteria: "Textos e estrutura definidos",
  },
  {
    key: "design",
    label: "Design",
    phase: "design",
    entryCriteria: "Conteúdo pronto",
    exitCriteria: "Layout institucional aprovado",
  },
  {
    key: "development",
    label: "Desenvolvimento",
    phase: "development",
    entryCriteria: "Design entregue",
    exitCriteria: "Site implementado",
  },
  {
    key: "publication",
    label: "Publicação",
    phase: "development",
    entryCriteria: "Desenvolvimento concluído",
    exitCriteria: "Site publicado",
  },
]);

export const APP_STAGES: readonly StageTemplateSnapshot[] = linear([
  {
    key: "discovery",
    label: "Discovery",
    phase: "commercial",
    entryCriteria: "Pedido de app recebido",
    exitCriteria: "Escopo de discovery fechado",
  },
  {
    key: "ux",
    label: "UX",
    phase: "design",
    entryCriteria: "Discovery concluído",
    exitCriteria: "Fluxos de UX definidos",
  },
  {
    key: "development",
    label: "Desenvolvimento",
    phase: "development",
    entryCriteria: "UX entregue",
    exitCriteria: "Build do app disponível",
  },
  {
    key: "tests",
    label: "Testes",
    phase: "development",
    entryCriteria: "Desenvolvimento entregue",
    exitCriteria: "Testes concluídos",
  },
  {
    key: "store",
    label: "Loja",
    phase: "development",
    entryCriteria: "Testes concluídos",
    exitCriteria: "App publicado na loja",
  },
]);

export const ECOMMERCE_STAGES: readonly StageTemplateSnapshot[] = linear([
  {
    key: "catalog",
    label: "Catálogo",
    phase: "commercial",
    entryCriteria: "Pedido de loja recebido",
    exitCriteria: "Catálogo e regras definidos",
  },
  {
    key: "design",
    label: "Design",
    phase: "design",
    entryCriteria: "Catálogo alinhado",
    exitCriteria: "Layout da loja aprovado",
  },
  {
    key: "integration",
    label: "Integração",
    phase: "development",
    entryCriteria: "Design entregue",
    exitCriteria: "Pagamentos e estoque integrados",
  },
  {
    key: "homologation",
    label: "Homologação",
    phase: "development",
    entryCriteria: "Integração concluída",
    exitCriteria: "Homologação aprovada",
  },
  {
    key: "go_live",
    label: "Go-live",
    phase: "development",
    entryCriteria: "Homologação concluída",
    exitCriteria: "Loja no ar",
  },
]);

export const MAINTENANCE_STAGES: readonly StageTemplateSnapshot[] = linear([
  {
    key: "triage",
    label: "Triagem",
    phase: "commercial",
    entryCriteria: "Chamado recebido",
    exitCriteria: "Demanda triada",
  },
  {
    key: "fix",
    label: "Correção",
    phase: "development",
    entryCriteria: "Triagem concluída",
    exitCriteria: "Correção implementada",
  },
  {
    key: "validation",
    label: "Validação",
    phase: "development",
    entryCriteria: "Correção pronta",
    exitCriteria: "Validação interna ok",
  },
  {
    key: "delivery",
    label: "Entrega",
    phase: "development",
    entryCriteria: "Validação concluída",
    exitCriteria: "Entrega ao cliente",
  },
]);

export const WORKFLOW_CATALOG: readonly CatalogWorkflow[] = [
  { key: "landing", name: "Landing", isDefault: false, stages: LANDING_STAGES },
  {
    key: "institutional",
    name: "Institucional",
    isDefault: false,
    stages: INSTITUTIONAL_STAGES,
  },
  {
    key: SAAS_DELIVERY_KEY,
    name: SAAS_DELIVERY_NAME,
    isDefault: true,
    stages: SAAS_DELIVERY_STAGES,
  },
  { key: "app", name: "App", isDefault: false, stages: APP_STAGES },
  { key: "ecommerce", name: "E-commerce", isDefault: false, stages: ECOMMERCE_STAGES },
  { key: "maintenance", name: "Manutenção", isDefault: false, stages: MAINTENANCE_STAGES },
];

export const CATALOG_WORKFLOW_KEYS = new Set(WORKFLOW_CATALOG.map((item) => item.key));

export function isCatalogWorkflowKey(key: string): boolean {
  return CATALOG_WORKFLOW_KEYS.has(key);
}

export function catalogKeysOf(item: CatalogWorkflow): string[] {
  return item.stages.map((stage) => stage.key);
}
