import { describe, expect, it } from "vitest";
import { WORKFLOWS_FORBIDDEN, WORKFLOWS_NO_CANVAS } from "./workflow-copy";

describe("copy de workflows", () => {
  it("recusa canvas e explica permissão de member", () => {
    expect(WORKFLOWS_NO_CANVAS).toContain("formulário");
    expect(WORKFLOWS_NO_CANVAS.toLowerCase()).toContain("canvas");
    expect(WORKFLOWS_FORBIDDEN).toContain("owner");
  });
});
