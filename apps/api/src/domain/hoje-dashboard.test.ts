import { describe, expect, it } from "vitest";
import type { ApprovalRecord } from "../store/types.js";
import type { BlockerRecord } from "../store/types.js";
import type { MeetingRecord } from "../store/types.js";
import type { ReminderRecord } from "../store/types.js";
import type { ValidationRecord } from "../store/types.js";
import { PROPOSAL_WAITING_CLIENT_POLICY } from "./follow-up-policy.js";
import {
  HOJE_SECTION_LIMIT,
  buildHojeDashboard,
  type HojeCard,
} from "./hoje-dashboard.js";
import type { PipelineCardRow } from "./pipeline-board.js";

const now = new Date("2026-08-19T12:00:00.000Z");

function pipeline(overrides: Partial<PipelineCardRow> & Pick<PipelineCardRow, "id" | "name">): PipelineCardRow {
  return {
    clientId: "c1",
    clientName: "Cliente A",
    ownerUserId: "seed-user",
    ownerName: "Owner",
    dueDate: null,
    priority: "medium",
    status: "active",
    currentStageKey: "briefing",
    currentStageLabel: "Briefing",
    stageStatus: "in_progress",
    openBlockerCount: 0,
    waitingOnClient: false,
    ...overrides,
  };
}

function validation(overrides: Partial<ValidationRecord> & Pick<ValidationRecord, "id">): ValidationRecord {
  return {
    workspaceId: "ws-1",
    projectId: "p-val",
    projectName: "Proj Val",
    clientId: "c1",
    clientName: "Cliente A",
    stageId: null,
    type: "staging",
    reviewerUserId: null,
    reviewerName: null,
    requesterUserId: "seed-user",
    requesterName: "Owner",
    environment: null,
    status: "draft",
    requestedAt: null,
    dueDate: null,
    notes: null,
    items: [],
    resultNotes: null,
    checklistId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function approval(overrides: Partial<ApprovalRecord> & Pick<ApprovalRecord, "id">): ApprovalRecord {
  return {
    workspaceId: "ws-1",
    projectId: "p-appr",
    projectName: "Proj Appr",
    clientId: "c1",
    clientName: "Cliente A",
    subjectType: "project",
    subjectId: "p-appr",
    kind: "staging",
    status: "pending",
    validationId: null,
    approverId: null,
    approverName: null,
    decidedAt: null,
    revokedAt: null,
    comment: null,
    projectSnapshot: {
      currentStageKey: "briefing",
      projectStatus: "active",
      validationId: null,
      projectId: "p-appr",
      clientId: "c1",
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function blocker(overrides: Partial<BlockerRecord> & Pick<BlockerRecord, "id">): BlockerRecord {
  return {
    workspaceId: "ws-1",
    projectId: "p-blk",
    projectName: "Proj Blk",
    clientId: "c1",
    clientName: "Cliente A",
    title: "Aguardar login",
    assigneeKind: "internal",
    assigneeUserId: "seed-user",
    assigneeName: "Owner",
    blocksStageId: null,
    blocksProject: false,
    status: "open",
    dueDate: null,
    openedAt: now,
    resolvedAt: null,
    cancelledAt: null,
    sourceMeetingId: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function reminder(overrides: Partial<ReminderRecord> & Pick<ReminderRecord, "id">): ReminderRecord {
  return {
    workspaceId: "ws-1",
    subjectType: "project",
    subjectId: "p-rem",
    clientId: "c1",
    clientName: "Cliente A",
    projectId: "p-rem",
    projectName: "Proj Rem",
    channel: "internal",
    policyKey: null,
    status: "due",
    dueAt: now,
    snoozedUntil: null,
    doneAt: null,
    cancelledAt: null,
    draftMessage: "Oi",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function meeting(overrides: Partial<MeetingRecord> & Pick<MeetingRecord, "id">): MeetingRecord {
  return {
    workspaceId: "ws-1",
    title: "Kickoff",
    type: "kickoff",
    startsAt: now,
    participantUserIds: ["seed-user"],
    notes: null,
    decisions: null,
    nextSteps: null,
    clientId: "c1",
    clientName: "Cliente A",
    projectId: "p-meet",
    projectName: "Proj Meet",
    stageId: null,
    validationId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function idsOf(cards: HojeCard[]): string[] {
  return cards.map((card) => card.id);
}

function emptyInput() {
  return {
    now,
    attentionLeadDays: 3,
    pipeline: [] as PipelineCardRow[],
    validations: [] as ValidationRecord[],
    approvals: [] as ApprovalRecord[],
    blockers: [] as BlockerRecord[],
    reminders: [] as ReminderRecord[],
    meetings: [] as MeetingRecord[],
  };
}

describe("buildHojeDashboard", () => {
  it("classifica overdue, requested, client blocker e follow-up due", () => {
    const board = buildHojeDashboard({
      ...emptyInput(),
      pipeline: [
        pipeline({
          id: "p-overdue",
          name: "Atrasado",
          dueDate: new Date("2026-08-01T00:00:00.000Z"),
          status: "active",
        }),
        pipeline({
          id: "p-wait",
          name: "Espera",
          currentStageKey: "waiting_client",
          currentStageLabel: "Aguardando cliente",
        }),
      ],
      validations: [
        validation({
          id: "v-req",
          projectId: "p-val",
          projectName: "Proj Val",
          status: "requested",
          requestedAt: new Date("2026-08-18T00:00:00.000Z"),
        }),
      ],
      blockers: [
        blocker({
          id: "b-client",
          assigneeKind: "client",
          assigneeUserId: null,
          assigneeName: null,
        }),
      ],
      reminders: [
        reminder({
          id: "r-follow",
          policyKey: PROPOSAL_WAITING_CLIENT_POLICY,
          status: "due",
          dueAt: now,
          projectId: "p-wait",
          projectName: "Espera",
          subjectId: "p-wait",
        }),
      ],
    });

    expect(idsOf(board.needs_attention)).toContain("project:p-overdue");
    expect(idsOf(board.waiting_client)).toEqual(
      expect.arrayContaining(["validation:v-req", "blocker:b-client", "reminder:r-follow", "project:p-wait"]),
    );
    expect(idsOf(board.today)).toContain("reminder:r-follow");
    expect(idsOf(board.in_progress)).toEqual(expect.arrayContaining(["project:p-overdue", "project:p-wait"]));

    const overdue = board.needs_attention.find((card) => card.id === "project:p-overdue");
    expect(overdue).toMatchObject({
      clientName: "Cliente A",
      projectName: "Atrasado",
      reason: "Projeto atrasado",
      nextAction: "Abrir projeto",
      href: "/projetos/p-overdue",
    });
    expect(overdue?.since).toBe("2026-08-01T00:00:00.000Z");
  });

  it("inclui validação overdue, blocker atrasado, approval stale e reunião de hoje", () => {
    const board = buildHojeDashboard({
      ...emptyInput(),
      validations: [
        validation({
          id: "v-over",
          status: "in_review",
          dueDate: new Date("2026-08-10T00:00:00.000Z"),
        }),
      ],
      blockers: [
        blocker({
          id: "b-late",
          dueDate: new Date("2026-08-18T00:00:00.000Z"),
        }),
      ],
      approvals: [
        approval({
          id: "a-stale",
          createdAt: new Date("2026-08-15T12:00:00.000Z"),
        }),
        approval({
          id: "a-fresh",
          createdAt: new Date("2026-08-18T12:00:00.000Z"),
        }),
      ],
      reminders: [
        reminder({
          id: "r-today",
          dueAt: new Date("2026-08-19T08:00:00.000Z"),
          status: "due",
        }),
        reminder({
          id: "r-old",
          dueAt: new Date("2026-08-01T08:00:00.000Z"),
          status: "due",
        }),
      ],
      meetings: [
        meeting({ id: "m-today", startsAt: new Date("2026-08-19T15:00:00.000Z") }),
        meeting({ id: "m-other", startsAt: new Date("2026-08-20T15:00:00.000Z") }),
      ],
    });

    expect(idsOf(board.needs_attention)).toEqual(
      expect.arrayContaining(["validation:v-over", "blocker:b-late", "approval:a-stale"]),
    );
    expect(idsOf(board.needs_attention)).not.toContain("approval:a-fresh");
    expect(idsOf(board.today)).toEqual(expect.arrayContaining(["reminder:r-today", "meeting:m-today"]));
    expect(idsOf(board.today)).not.toContain("reminder:r-old");
    expect(idsOf(board.today)).not.toContain("meeting:m-other");
  });

  it("limita cada seção a 20 cards e devolve arrays vazios sem operação", () => {
    const pipelineCards = Array.from({ length: 25 }, (_, index) =>
      pipeline({
        id: `p-${String(index).padStart(2, "0")}`,
        name: `Proj ${String(index).padStart(2, "0")}`,
        dueDate: new Date(`2026-07-${String((index % 28) + 1).padStart(2, "0")}T00:00:00.000Z`),
        status: "active",
      }),
    );
    const full = buildHojeDashboard({ ...emptyInput(), pipeline: pipelineCards });
    expect(full.needs_attention).toHaveLength(HOJE_SECTION_LIMIT);
    expect(full.in_progress).toHaveLength(HOJE_SECTION_LIMIT);

    const empty = buildHojeDashboard(emptyInput());
    expect(empty).toEqual({
      needs_attention: [],
      today: [],
      waiting_client: [],
      in_progress: [],
    });
  });

  it("antecipa lembrete e reunião em Precisa de atenção conforme os dias", () => {
    const upcoming = buildHojeDashboard({
      ...emptyInput(),
      reminders: [
        reminder({
          id: "r-soon",
          status: "scheduled",
          dueAt: new Date("2026-08-22T09:00:00.000Z"),
        }),
      ],
      meetings: [meeting({ id: "m-soon", startsAt: new Date("2026-08-21T15:00:00.000Z") })],
    });
    expect(upcoming.needs_attention.map((card) => card.id)).toEqual(["meeting:m-soon", "reminder:r-soon"]);
    expect(upcoming.needs_attention.every((card) => card.alert)).toBe(true);

    const none = buildHojeDashboard({
      ...emptyInput(),
      attentionLeadDays: 0,
      reminders: [
        reminder({
          id: "r-soon",
          status: "scheduled",
          dueAt: new Date("2026-08-22T09:00:00.000Z"),
        }),
      ],
    });
    expect(none.needs_attention.map((card) => card.id)).not.toContain("reminder:r-soon");
  });
});
