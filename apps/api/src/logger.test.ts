import { describe, expect, it } from "vitest";
import { redact } from "./logger";

describe("logger redacted", () => {
  it("não vaza senha nem secret", () => {
    expect(
      redact({
        email: "owner@example.com",
        password: "changeme",
        AUTH_SECRET: "super-secret",
        nested: { token: "abc" },
      }),
    ).toEqual({
      email: "owner@example.com",
      password: "[redacted]",
      AUTH_SECRET: "[redacted]",
      nested: { token: "[redacted]" },
    });
  });
});
