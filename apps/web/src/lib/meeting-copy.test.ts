import { describe, expect, it } from "vitest";
import { meetingHref } from "./meeting-copy";

describe("links de reuniões", () => {
  it("monta a ficha", () => {
    expect(meetingHref("abc")).toBe("/reunioes/abc");
  });
});
