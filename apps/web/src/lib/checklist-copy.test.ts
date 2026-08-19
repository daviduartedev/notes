import { describe, expect, it } from "vitest";
import { CHECKLISTS_EMPTY, checklistProjectHref } from "./checklist-copy";

describe("checklist copy", () => {
  it("leva a instância à ficha do projeto", () => {
    expect(checklistProjectHref("abc")).toBe("/projetos/abc");
    expect(CHECKLISTS_EMPTY).toContain("checklist");
  });
});
