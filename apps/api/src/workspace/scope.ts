import type { SessionPayload } from "../auth/session.js";

export function workspaceIdFromSession(
  session: SessionPayload,
  untrusted?: { body?: unknown; query?: unknown },
): string | null {
  void untrusted?.body;
  void untrusted?.query;
  return session.workspaceId;
}

export function hasMembership(session: SessionPayload): boolean {
  return Boolean(session.workspaceId && session.role);
}

export function isCrossTenant(
  resourceWorkspaceId: string,
  sessionWorkspaceId: string,
): boolean {
  return resourceWorkspaceId !== sessionWorkspaceId;
}
