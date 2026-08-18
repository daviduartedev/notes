import type { Context } from "hono";
import type { AppDeps } from "../deps.js";
import { readLiveSession } from "../auth/read-session.js";
import type { SessionPayload } from "../auth/session.js";
import { hasMembership } from "../workspace/scope.js";

export type SessionGate =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: Response };

export async function requireMember(
  c: Context,
  deps: Pick<AppDeps, "authSecret" | "getSessionVersion">,
): Promise<SessionGate> {
  const session = await readLiveSession(c, deps);
  if (!session) {
    return { ok: false, response: c.json({ error: "Não autenticado" }, 401) };
  }
  if (!hasMembership(session)) {
    return { ok: false, response: c.json({ error: "Sem permissão" }, 403) };
  }
  return { ok: true, session };
}

export function emptyNotFound(c: Context): Response {
  return c.body(null, 404);
}
