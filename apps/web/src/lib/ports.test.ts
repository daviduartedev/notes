import { describe, expect, it } from "vitest";
import { WEB_PORT, publicOrigin } from "./ports";

describe("web ports", () => {
  it("usa a porta 3015", () => {
    expect(WEB_PORT).toBe(3015);
    expect(publicOrigin()).toBe("http://localhost:3015");
  });
});
