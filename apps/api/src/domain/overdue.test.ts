import { describe, expect, it } from "vitest";
import { projectVisualState } from "./overdue";

const now = new Date("2026-08-18T12:00:00.000Z");

describe("visualState overdue", () => {
  it("marca active com prazo passado como overdue", () => {
    expect(
      projectVisualState("active", new Date("2026-08-01T00:00:00.000Z"), now),
    ).toBe("overdue");
  });

  it("não marca draft com prazo passado", () => {
    expect(
      projectVisualState("draft", new Date("2026-08-01T00:00:00.000Z"), now),
    ).toBeNull();
  });

  it("não marca active com prazo futuro", () => {
    expect(
      projectVisualState("active", new Date("2026-08-30T00:00:00.000Z"), now),
    ).toBeNull();
  });

  it("não marca active sem prazo", () => {
    expect(projectVisualState("active", null, now)).toBeNull();
  });
});
