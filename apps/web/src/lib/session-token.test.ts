import { encode } from "@auth/core/jwt";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE, verifySessionToken } from "./session-token";

const secret = "a".repeat(32);

async function signedToken(): Promise<string> {
  return encode({
    token: { sub: "user-1", email: "owner@example.com" },
    secret,
    salt: SESSION_COOKIE,
    maxAge: 60 * 60,
  });
}

describe("verifySessionToken", () => {
  it("aceita JWT assinado com AUTH_SECRET", async () => {
    const token = await signedToken();
    await expect(verifySessionToken(token, secret)).resolves.toBe(true);
  });

  it("rejeita assinatura inválida", async () => {
    const token = await signedToken();
    await expect(verifySessionToken(token, "b".repeat(32))).resolves.toBe(false);
  });

  it("rejeita cookie forjado", async () => {
    await expect(verifySessionToken("forged", secret)).resolves.toBe(false);
  });
});
