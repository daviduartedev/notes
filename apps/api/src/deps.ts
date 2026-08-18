export type MemberRole = "owner" | "member";

export type AuthResult = {
  userId: string;
  email: string;
  workspaceId: string | null;
  role: MemberRole | null;
};

export type Authenticate = (
  email: string,
  password: string,
) => Promise<AuthResult | null>;

export type WorkspaceRecord = {
  id: string;
  name: string;
};

export type AppDeps = {
  authSecret: string;
  webOrigin: string;
  authenticate: Authenticate;
  getWorkspace: (workspaceId: string) => Promise<WorkspaceRecord | null>;
};

export const testDeps: AppDeps = {
  authSecret: "a".repeat(32),
  webOrigin: "http://localhost:3015",
  authenticate: async (email, password) => {
    if (email === "owner@example.com" && password === "changeme") {
      return {
        userId: "seed-user",
        email,
        workspaceId: "ws-1",
        role: "owner",
      };
    }
    if (email === "nomember@example.com" && password === "changeme") {
      return {
        userId: "no-member",
        email,
        workspaceId: null,
        role: null,
      };
    }
    return null;
  },
  getWorkspace: async (workspaceId) => {
    if (workspaceId === "ws-1") {
      return { id: "ws-1", name: "Notes" };
    }
    return null;
  },
};
