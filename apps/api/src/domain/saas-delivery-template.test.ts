import { describe, expect, it } from "vitest";
import { SAAS_DELIVERY_STAGES } from "./saas-delivery-template";

describe("template SaaS delivery", () => {
  it("tem 10 etapas lineares com fases comercial/design/dev", () => {
    expect(SAAS_DELIVERY_STAGES).toHaveLength(10);
    expect(SAAS_DELIVERY_STAGES.map((stage) => stage.key)).toEqual([
      "briefing",
      "proposal",
      "waiting_client",
      "kickoff",
      "ux",
      "prototype",
      "design_handoff",
      "development",
      "staging",
      "production",
    ]);
    expect(SAAS_DELIVERY_STAGES.map((stage) => stage.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(SAAS_DELIVERY_STAGES.filter((stage) => stage.phase === "commercial").map((s) => s.key)).toEqual([
      "briefing",
      "proposal",
      "waiting_client",
      "kickoff",
    ]);
    expect(SAAS_DELIVERY_STAGES.filter((stage) => stage.phase === "design").map((s) => s.key)).toEqual([
      "ux",
      "prototype",
      "design_handoff",
    ]);
    expect(SAAS_DELIVERY_STAGES.at(-1)?.allowedNextKeys).toEqual([]);
    for (let index = 0; index < SAAS_DELIVERY_STAGES.length - 1; index += 1) {
      const stage = SAAS_DELIVERY_STAGES[index];
      const next = SAAS_DELIVERY_STAGES[index + 1];
      expect(stage?.allowedNextKeys).toEqual([next?.key]);
    }
  });
});
