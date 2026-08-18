import { describe, expect, it } from "vitest";
import { SAAS_DELIVERY_STAGES } from "./saas-delivery-template";
import {
  copyStageFromTemplate,
  instantiateProjectStages,
} from "./stage-instance";

describe("instância ≠ template", () => {
  it("copia key, phase, order, allowedNextKeys e critérios por valor", () => {
    const template = SAAS_DELIVERY_STAGES[0];
    expect(template).toBeDefined();
    if (!template) return;
    const copy = copyStageFromTemplate(template);
    expect(copy.key).toBe("briefing");
    expect(copy.phase).toBe("commercial");
    expect(copy.order).toBe(1);
    expect(copy.allowedNextKeys).toEqual(["proposal"]);
    expect(copy.entryCriteria).toBe(template.entryCriteria);
    expect(copy.exitCriteria).toBe(template.exitCriteria);
    copy.allowedNextKeys.push("production");
    copy.entryCriteria = "mutado";
    expect(template.allowedNextKeys).toEqual(["proposal"]);
    expect(template.entryCriteria).toBe("Pedido comercial recebido");
  });

  it("mutar o seed depois não reescreve instâncias já copiadas", () => {
    const mutable = SAAS_DELIVERY_STAGES.map((stage) => ({
      ...stage,
      allowedNextKeys: [...stage.allowedNextKeys],
    }));
    const { stages, currentStageId } = instantiateProjectStages(mutable);
    const briefingTemplate = mutable.find((stage) => stage.key === "briefing");
    expect(briefingTemplate).toBeDefined();
    briefingTemplate?.allowedNextKeys.splice(0, 1, "production");
    const briefingInstance = stages.find((stage) => stage.key === "briefing");
    expect(briefingInstance?.allowedNextKeys).toEqual(["proposal"]);
    expect(stages.filter((stage) => stage.id === currentStageId)).toHaveLength(1);
    expect(stages.filter((stage) => stage.status === "in_progress")).toHaveLength(1);
    expect(stages.filter((stage) => stage.status === "pending")).toHaveLength(9);
  });

  it("instancia exatamente uma etapa atual", () => {
    const { stages, currentStageId } = instantiateProjectStages(SAAS_DELIVERY_STAGES);
    expect(stages).toHaveLength(10);
    const current = stages.find((stage) => stage.id === currentStageId);
    expect(current?.key).toBe("briefing");
    expect(current?.status).toBe("in_progress");
    expect(stages.filter((stage) => stage.status === "in_progress")).toHaveLength(1);
  });
});
