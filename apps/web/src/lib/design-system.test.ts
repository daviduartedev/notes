import { describe, expect, it } from "vitest";
import { isDesignSystemEnabled } from "./design-system";

describe("design-system access", () => {
  it("fica visível fora de production", () => {
    expect(isDesignSystemEnabled("development")).toBe(true);
    expect(isDesignSystemEnabled("test")).toBe(true);
  });

  it("retorna 404 em production", () => {
    expect(isDesignSystemEnabled("production")).toBe(false);
  });
});
