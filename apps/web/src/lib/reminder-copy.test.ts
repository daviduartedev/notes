import { describe, expect, it } from "vitest";
import { reminderHref } from "./reminder-copy";

describe("links de lembretes", () => {
  it("monta a ficha", () => {
    expect(reminderHref("abc")).toBe("/lembretes/abc");
  });
});
