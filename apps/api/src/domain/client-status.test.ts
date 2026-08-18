import { describe, expect, it } from "vitest";
import { canTransitionClientStatus } from "./client-status";

describe("transições de Client.status", () => {
  it("permite lead para active ou archived", () => {
    expect(canTransitionClientStatus("lead", "active")).toBe(true);
    expect(canTransitionClientStatus("lead", "archived")).toBe(true);
    expect(canTransitionClientStatus("lead", "inactive")).toBe(false);
  });

  it("permite active para inactive ou archived", () => {
    expect(canTransitionClientStatus("active", "inactive")).toBe(true);
    expect(canTransitionClientStatus("active", "archived")).toBe(true);
    expect(canTransitionClientStatus("active", "lead")).toBe(false);
  });

  it("permite inactive para active ou archived", () => {
    expect(canTransitionClientStatus("inactive", "active")).toBe(true);
    expect(canTransitionClientStatus("inactive", "archived")).toBe(true);
    expect(canTransitionClientStatus("inactive", "lead")).toBe(false);
  });

  it("trata archived como terminal", () => {
    expect(canTransitionClientStatus("archived", "active")).toBe(false);
    expect(canTransitionClientStatus("archived", "lead")).toBe(false);
    expect(canTransitionClientStatus("archived", "archived")).toBe(true);
  });
});
