import type { SessionPayload } from "../auth/session.js";
import { isCrossTenant, workspaceIdFromSession } from "./scope.js";

export async function lookupForSession<T>(
  session: SessionPayload,
  requestedId: string,
  load: (id: string) => Promise<T | null>,
  workspaceIdOf: (record: T) => string,
): Promise<T | null> {
  const sessionWorkspaceId = workspaceIdFromSession(session);
  if (!sessionWorkspaceId) {
    return null;
  }
  const record = await load(requestedId);
  if (!record) {
    return null;
  }
  if (isCrossTenant(workspaceIdOf(record), sessionWorkspaceId)) {
    return null;
  }
  return record;
}
