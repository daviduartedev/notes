import { describe, expect, it } from "vitest";
import { decodeSession, encodeSession } from "./session";

const secret = "a".repeat(32);

describe("auth session", () => {
  it("codifica e decodifica o payload", async () => {
    const payload = {
      sub: "user-1",
      email: "owner@example.com",
      workspaceId: "ws-1",
      role: "owner" as const,
    };
    const token = await encodeSession(payload, secret);
    await expect(decodeSession(token, secret)).resolves.toEqual(payload);
  });

  it("rejeita token com secret errado", async () => {
    const token = await encodeSession(
      { sub: "user-1", email: "a@b.c", workspaceId: null, role: null },
      secret,
    );
    await expect(decodeSession(token, "b".repeat(32))).resolves.toBeNull();
  });
});
