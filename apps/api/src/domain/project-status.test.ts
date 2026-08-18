import { describe, expect, it } from "vitest";
import { canTransitionProjectStatus } from "./project-status";

describe("transições de Project.status", () => {
  it("permite draft para active ou cancelled", () => {
    expect(canTransitionProjectStatus("draft", "active")).toBe(true);
    expect(canTransitionProjectStatus("draft", "cancelled")).toBe(true);
    expect(canTransitionProjectStatus("draft", "completed")).toBe(false);
    expect(canTransitionProjectStatus("draft", "on_hold")).toBe(false);
  });

  it("permite active para on_hold, completed ou cancelled", () => {
    expect(canTransitionProjectStatus("active", "on_hold")).toBe(true);
    expect(canTransitionProjectStatus("active", "completed")).toBe(true);
    expect(canTransitionProjectStatus("active", "cancelled")).toBe(true);
    expect(canTransitionProjectStatus("active", "draft")).toBe(false);
  });

  it("permite on_hold para active ou cancelled", () => {
    expect(canTransitionProjectStatus("on_hold", "active")).toBe(true);
    expect(canTransitionProjectStatus("on_hold", "cancelled")).toBe(true);
    expect(canTransitionProjectStatus("on_hold", "completed")).toBe(false);
  });

  it("trata completed e cancelled como terminais", () => {
    expect(canTransitionProjectStatus("completed", "active")).toBe(false);
    expect(canTransitionProjectStatus("cancelled", "active")).toBe(false);
    expect(canTransitionProjectStatus("completed", "completed")).toBe(true);
    expect(canTransitionProjectStatus("cancelled", "cancelled")).toBe(true);
  });
});
