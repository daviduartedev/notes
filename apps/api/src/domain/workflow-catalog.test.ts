import { describe, expect, it } from "vitest";
import { instantiateProjectStages } from "./stage-instance";
import {
  APP_STAGES,
  ECOMMERCE_STAGES,
  INSTITUTIONAL_STAGES,
  LANDING_STAGES,
  MAINTENANCE_STAGES,
  WORKFLOW_CATALOG,
  catalogKeysOf,
  isCatalogWorkflowKey,
} from "./workflow-catalog";
import { SAAS_DELIVERY_KEY, SAAS_DELIVERY_STAGES } from "./saas-delivery-template";

function expectLinear(stages: readonly { key: string; allowedNextKeys: readonly string[] }[]) {
  expect(stages.at(-1)?.allowedNextKeys).toEqual([]);
  for (let index = 0; index < stages.length - 1; index += 1) {
    const stage = stages[index];
    const next = stages[index + 1];
    expect(stage?.allowedNextKeys).toEqual([next?.key]);
  }
}

describe("catálogo de workflow", () => {
  it("tem os seis tipos sem duplicar SaaS e marca default", () => {
    expect(WORKFLOW_CATALOG.map((item) => item.key)).toEqual([
      "landing",
      "institutional",
      SAAS_DELIVERY_KEY,
      "app",
      "ecommerce",
      "maintenance",
    ]);
    expect(WORKFLOW_CATALOG.filter((item) => item.key === SAAS_DELIVERY_KEY)).toHaveLength(1);
    expect(WORKFLOW_CATALOG.filter((item) => item.isDefault).map((item) => item.key)).toEqual([
      SAAS_DELIVERY_KEY,
    ]);
    expect(isCatalogWorkflowKey(SAAS_DELIVERY_KEY)).toBe(true);
    expect(isCatalogWorkflowKey("custom_flow")).toBe(false);
  });

  it("define grafos lineares de 4 a 8 etapas", () => {
    expect(LANDING_STAGES).toHaveLength(4);
    expect(catalogKeysOf(WORKFLOW_CATALOG[0]!)).toEqual([
      "briefing",
      "design",
      "development",
      "publication",
    ]);
    expect(INSTITUTIONAL_STAGES.map((stage) => stage.label)).toEqual([
      "Briefing",
      "Conteúdo",
      "Design",
      "Desenvolvimento",
      "Publicação",
    ]);
    expect(APP_STAGES.map((stage) => stage.key)).toEqual([
      "discovery",
      "ux",
      "development",
      "tests",
      "store",
    ]);
    expect(ECOMMERCE_STAGES.map((stage) => stage.label)).toEqual([
      "Catálogo",
      "Design",
      "Integração",
      "Homologação",
      "Go-live",
    ]);
    expect(MAINTENANCE_STAGES.map((stage) => stage.key)).toEqual([
      "triage",
      "fix",
      "validation",
      "delivery",
    ]);
    expect(SAAS_DELIVERY_STAGES).toHaveLength(10);
    for (const item of WORKFLOW_CATALOG) {
      expect(item.stages.length).toBeGreaterThanOrEqual(4);
      expect(item.stages.length).toBeLessThanOrEqual(10);
      expectLinear(item.stages);
    }
  });

  it("Landing e SaaS geram conjuntos de etapas diferentes", () => {
    const landing = instantiateProjectStages(LANDING_STAGES).stages.map((stage) => stage.key);
    const saas = instantiateProjectStages(SAAS_DELIVERY_STAGES).stages.map((stage) => stage.key);
    expect(landing).not.toEqual(saas);
    expect(landing).toHaveLength(4);
    expect(saas).toHaveLength(10);
  });
});
