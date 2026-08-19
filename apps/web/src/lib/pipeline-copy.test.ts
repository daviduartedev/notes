import { describe, expect, it } from "vitest";
import { PIPELINE_EMPTY, pipelineCardHref } from "./pipeline-copy";

describe("pipeline copy", () => {
  it("leva o card à ficha do projeto", () => {
    expect(pipelineCardHref("abc")).toBe("/projetos/abc");
    expect(PIPELINE_EMPTY).toContain("quadro");
  });
});
