import { describe, expect, it } from "vitest";
import { VALIDATIONS_EMPTY, validationHref } from "./validation-copy";

describe("validation copy", () => {
  it("leva a ficha da validação", () => {
    expect(validationHref("abc")).toBe("/validacoes/abc");
    expect(VALIDATIONS_EMPTY).toContain("validação");
  });
});
