import type { NotesStore } from "./store/types.js";
import { createMemoryStore, TEST_MEMBERS } from "./store/memory.js";
import { DEFAULT_ATTENTION_LEAD_DAYS } from "./domain/attention-lead.js";

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
  attentionLeadDays: number;
};

export type AppDeps = {
  authSecret: string;
  webOrigin: string;
  authenticate: Authenticate;
  getWorkspace: (workspaceId: string) => Promise<WorkspaceRecord | null>;
  updateWorkspace: (
    workspaceId: string,
    patch: { attentionLeadDays: number },
  ) => Promise<WorkspaceRecord | null>;
  getSessionVersion: (userId: string) => Promise<number | null>;
  bumpSessionVersion: (userId: string) => Promise<void>;
  store: NotesStore;
  now: () => Date;
};

export function createTestDeps(overrides: Partial<AppDeps> = {}): AppDeps {
  const versions = new Map<string, number>([
    ["seed-user", 0],
    ["no-member", 0],
    ["seed-user-b", 0],
    ["member-user", 0],
  ]);

  const leadDays = new Map<string, number>([
    ["ws-1", DEFAULT_ATTENTION_LEAD_DAYS],
    ["ws-2", DEFAULT_ATTENTION_LEAD_DAYS],
  ]);

  const workspaceNamed: Record<string, string> = {
    "ws-1": "Notes",
    "ws-2": "Outro",
  };

  function workspaceRecord(workspaceId: string): WorkspaceRecord | null {
    const name = workspaceNamed[workspaceId];
    if (!name) {
      return null;
    }
    return {
      id: workspaceId,
      name,
      attentionLeadDays: leadDays.get(workspaceId) ?? DEFAULT_ATTENTION_LEAD_DAYS,
    };
  }

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
      if (email === "owner-b@example.com" && password === "changeme") {
        return {
          userId: "seed-user-b",
          email,
          workspaceId: "ws-2",
          role: "owner",
          sessionVersion: versions.get("seed-user-b") ?? 0,
        };
      }
      if (email === "member@example.com" && password === "changeme") {
        return {
          userId: "member-user",
          email,
          workspaceId: "ws-1",
          role: "member",
          sessionVersion: versions.get("member-user") ?? 0,
        };
      }
      return null;
    },
    getWorkspace: async (workspaceId) => workspaceRecord(workspaceId),
    updateWorkspace: async (workspaceId, patch) => {
      if (!workspaceNamed[workspaceId]) {
        return null;
      }
      leadDays.set(workspaceId, patch.attentionLeadDays);
      return workspaceRecord(workspaceId);
    },
    getSessionVersion: async (userId) => (versions.has(userId) ? (versions.get(userId) ?? 0) : null),
    bumpSessionVersion: async (userId) => {
      versions.set(userId, (versions.get(userId) ?? 0) + 1);
    },
    store: createMemoryStore(TEST_MEMBERS),
    now: () => new Date(),
  };

  return { ...deps, ...overrides };
}

export const testDeps = createTestDeps();
