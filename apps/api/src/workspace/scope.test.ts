import { describe, expect, it } from "vitest";
import type { SessionPayload } from "../auth/session";
import { hasMembership, isCrossTenant, workspaceIdFromSession } from "./scope";

const owner: SessionPayload = {
  sub: "u1",
  email: "owner@example.com",
  workspaceId: "ws-1",
  role: "owner",
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
});
