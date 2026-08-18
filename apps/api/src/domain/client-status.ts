import type { ClientStatus } from "./types.js";

const TRANSITIONS: Record<ClientStatus, readonly ClientStatus[]> = {
  lead: ["active", "archived"],
  active: ["inactive", "archived"],
  inactive: ["active", "archived"],
  archived: [],
};

export function canTransitionClientStatus(
  from: ClientStatus,
  to: ClientStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return TRANSITIONS[from].includes(to);
}
