export type MemberRole = "owner" | "member";

export type AuthResult = {
  userId: string;
  email: string;
  workspaceId: string | null;
  role: MemberRole | null;
  sessionVersion: number;
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
  getSessionVersion: (userId: string) => Promise<number | null>;
  bumpSessionVersion: (userId: string) => Promise<void>;
};

export function createTestDeps(overrides: Partial<AppDeps> = {}): AppDeps {
  const versions = new Map<string, number>([
    ["seed-user", 0],
    ["no-member", 0],
  ]);

  const deps: AppDeps = {
    authSecret: "a".repeat(32),
    webOrigin: "http://localhost:3015",
    authenticate: async (email, password) => {
      if (email === "owner@example.com" && password === "changeme") {
        return {
          userId: "seed-user",
          email,
          workspaceId: "ws-1",
          role: "owner",
          sessionVersion: versions.get("seed-user") ?? 0,
        };
      }
      if (email === "nomember@example.com" && password === "changeme") {
        return {
          userId: "no-member",
          email,
          workspaceId: null,
          role: null,
          sessionVersion: versions.get("no-member") ?? 0,
        };
      }
      return null;
    },
    getWorkspace: async (workspaceId) => {
      if (workspaceId === "ws-1") {
        return { id: "ws-1", name: "Notes" };
      }
      if (workspaceId === "ws-2") {
        return { id: "ws-2", name: "Outro" };
      }
      return null;
    },
    getSessionVersion: async (userId) => (versions.has(userId) ? (versions.get(userId) ?? 0) : null),
    bumpSessionVersion: async (userId) => {
      versions.set(userId, (versions.get(userId) ?? 0) + 1);
    },
  };

  return { ...deps, ...overrides };
}

export const testDeps = createTestDeps();
