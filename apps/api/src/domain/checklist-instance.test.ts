import { describe, expect, it } from "vitest";
import { DEPLOY_STAGING_ITEMS, DEPLOY_STAGING_TEMPLATE_NAME } from "./deploy-staging-template";
import { instantiateProjectChecklist } from "./checklist-instance";

describe("instância de checklist ≠ template", () => {
  it("copia name e os 8 itens do Deploy Staging SaaS por valor", () => {
    const template = {
      id: "tpl-1",
      name: DEPLOY_STAGING_TEMPLATE_NAME,
      items: DEPLOY_STAGING_ITEMS.map((item) => ({ ...item })),
    };
    const copy = instantiateProjectChecklist(template);
    expect(copy.name).toBe("Deploy Staging SaaS");
    expect(copy.templateId).toBe("tpl-1");
    expect(copy.validationId).toBeNull();
    expect(copy.items).toHaveLength(8);
    expect(copy.items.map((item) => item.title)).toEqual([
      "Environment",
      "Migrations",
      "API keys sandbox",
      "Deploy",
      "Smoke tests",
      "Autenticação",
      "Fluxo principal",
      "Logs",
    ]);
    expect(copy.items.every((item) => item.completedAt === null)).toBe(true);
    copy.items[0]!.title = "mutado";
    expect(template.items[0]?.title).toBe("Environment");
  });

  it("mutar o molde depois não reescreve instâncias já copiadas", () => {
    const items = DEPLOY_STAGING_ITEMS.map((item) => ({ title: item.title as string, order: item.order }));
    const template = { id: "tpl-1", name: DEPLOY_STAGING_TEMPLATE_NAME, items };
    const first = instantiateProjectChecklist(template);
    const second = instantiateProjectChecklist(template);
    items[0]!.title = "Environment ALTERADO";
    template.name = "Molde novo";
    expect(first.name).toBe("Deploy Staging SaaS");
    expect(first.items[0]?.title).toBe("Environment");
    expect(second.items[0]?.title).toBe("Environment");
    expect(first.items[0]).not.toBe(second.items[0]);
  });
});
