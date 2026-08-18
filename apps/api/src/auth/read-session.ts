import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import type { AppDeps } from "../deps.js";
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

export async function readLiveSession(
  c: Context,
  deps: Pick<AppDeps, "authSecret" | "getSessionVersion">,
): Promise<SessionPayload | null> {
  const session = await readSession(c, deps.authSecret);
  if (!session) {
    return null;
  }
  const version = await deps.getSessionVersion(session.sub);
  if (version === null || version !== session.sessionVersion) {
    return null;
  }
  return session;
}
