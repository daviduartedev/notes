import { describe, expect, it } from "vitest";
import {
  evaluateFollowUpPolicies,
  FOLLOW_UP_THRESHOLD_MS,
  PROPOSAL_WAITING_CLIENT_POLICY,
  proposalFollowUpDraft,
  shouldCreateProposalFollowUp,
  type FollowUpProject,
} from "./follow-up-policy.js";

function project(overrides: Partial<FollowUpProject> = {}): FollowUpProject {
  return {
    id: "proj-1",
    workspaceId: "ws-1",
    clientId: "cli-1",
    name: "Acme CRM",
    clientName: "Acme",
    currentStageKey: "waiting_client",
    lastInteractionAt: new Date("2026-08-10T00:00:00.000Z"),
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("política proposalWaitingClientFollowUp", () => {
  it("cria reminder com relógio fake após 3 dias em waiting_client", () => {
    const now = new Date("2026-08-13T00:00:00.000Z");
    expect(now.getTime() - new Date("2026-08-10T00:00:00.000Z").getTime()).toBe(
      FOLLOW_UP_THRESHOLD_MS,
    );
    const result = evaluateFollowUpPolicies({
      now,
      projects: [project()],
      existing: [],
    });
    expect(result.create).toHaveLength(1);
    expect(result.create[0]).toMatchObject({
      policyKey: PROPOSAL_WAITING_CLIENT_POLICY,
      channel: "internal",
      status: "due",
      projectId: "proj-1",
      subjectType: "project",
    });
    expect(result.create[0]?.draftMessage).toBe(proposalFollowUpDraft("Acme", "Acme CRM"));
  });

  it("não cria se a etapa não é waiting_client", () => {
    const now = new Date("2026-08-20T00:00:00.000Z");
    expect(
      shouldCreateProposalFollowUp(project({ currentStageKey: "proposal" }), [], now),
    ).toBe(false);
  });

  it("não cria se a última interação é recente", () => {
    const now = new Date("2026-08-11T00:00:00.000Z");
    expect(shouldCreateProposalFollowUp(project(), [], now)).toBe(false);
  });

  it("não duplica scheduled/due da mesma política", () => {
    const now = new Date("2026-08-20T00:00:00.000Z");
    expect(
      shouldCreateProposalFollowUp(
        project(),
        [
          {
            id: "rem-1",
            projectId: "proj-1",
            policyKey: PROPOSAL_WAITING_CLIENT_POLICY,
            status: "due",
            dueAt: now,
          },
        ],
        now,
      ),
    ).toBe(false);
  });

  it("marca scheduled existente para promover quando dueAt passou", () => {
    const now = new Date("2026-08-19T00:00:00.000Z");
    const result = evaluateFollowUpPolicies({
      now,
      projects: [project({ currentStageKey: "kickoff" })],
      existing: [
        {
          id: "rem-old",
          projectId: "proj-1",
          policyKey: PROPOSAL_WAITING_CLIENT_POLICY,
          status: "scheduled",
          dueAt: new Date("2026-08-18T00:00:00.000Z"),
        },
      ],
    });
    expect(result.promoteIds).toEqual(["rem-old"]);
    expect(result.create).toHaveLength(0);
  });
});
