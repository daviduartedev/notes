import { describe, expect, it } from "vitest";
import type { SessionPayload } from "../auth/session";
import { lookupForSession } from "./lookup";
import { hasMembership, isCrossTenant, workspaceIdFromSession } from "./scope";

const owner: SessionPayload = {
  sub: "u1",
  email: "owner@example.com",
  workspaceId: "ws-1",
  role: "owner",
  sessionVersion: 0,
};

describe("isolamento de workspace", () => {
  it("usa só o workspaceId da sessão e ignora body/query", () => {
    expect(
      workspaceIdFromSession(owner, {
        body: { workspaceId: "ws-evil" },
        query: { workspaceId: "ws-evil" },
      }),
    ).toBe("ws-1");
  });

  it("detecta membro sem membership", () => {
    expect(
      hasMembership({ ...owner, workspaceId: null, role: null }),
    ).toBe(false);
  });

  it("marca recurso de outro tenant", () => {
    expect(isCrossTenant("ws-2", "ws-1")).toBe(true);
    expect(isCrossTenant("ws-1", "ws-1")).toBe(false);
  });

  it("lookup por id devolve o recurso da sessão e oculta o de outro tenant", async () => {
    const workspaces = {
      "ws-1": { id: "ws-1", name: "Notes", workspaceId: "ws-1" },
      "ws-2": { id: "ws-2", name: "Outro", workspaceId: "ws-2" },
    };
    const load = async (id: string) => workspaces[id as keyof typeof workspaces] ?? null;

    await expect(
      lookupForSession(owner, "ws-1", load, (row) => row.workspaceId),
    ).resolves.toEqual(workspaces["ws-1"]);
    await expect(
      lookupForSession(owner, "ws-2", load, (row) => row.workspaceId),
    ).resolves.toBeNull();
  });
});
