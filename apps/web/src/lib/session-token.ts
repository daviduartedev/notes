import { decode } from "@auth/core/jwt";

export const SESSION_COOKIE = "authjs.session-token";

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) {
    return false;
  }
  try {
    const decoded = await decode({
      token,
      secret,
      salt: SESSION_COOKIE,
    });
    return Boolean(decoded && typeof decoded.sub === "string");
  } catch {
    return false;
  }
}
