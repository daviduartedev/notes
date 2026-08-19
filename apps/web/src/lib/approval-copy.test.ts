import { describe, expect, it } from "vitest";
import { APPROVALS_EMPTY, approvalHref } from "./approval-copy";

describe("approval copy", () => {
  it("leva a ficha da aprovação", () => {
    expect(approvalHref("abc")).toBe("/aprovacoes/abc");
    expect(APPROVALS_EMPTY).toContain("aprovação");
  });
});
