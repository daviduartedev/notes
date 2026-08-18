import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { decodeSession, SESSION_COOKIE, type SessionPayload } from "../auth/session.js";

export async function readSession(
  c: Context,
  secret: string,
): Promise<SessionPayload | null> {
  const raw = getCookie(c, SESSION_COOKIE);
  if (!raw) {
    return null;
  }
  return decodeSession(raw, secret);
}
