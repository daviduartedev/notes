import { describe, expect, it } from "vitest";
import { BLOCKERS_EMPTY, WAITING_ON_CLIENT_COPY, blockerHref } from "./blocker-copy";

describe("blocker copy", () => {
  it("leva a ficha da pendência e copy do cliente", () => {
    expect(blockerHref("abc")).toBe("/pendencias/abc");
    expect(BLOCKERS_EMPTY).toContain("pendência");
    expect(WAITING_ON_CLIENT_COPY).toBe("Aguardando cliente");
  });
});
