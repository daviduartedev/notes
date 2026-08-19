import { describe, expect, it } from "vitest";
import { buildPipelineBoard, type PipelineCardRow } from "./pipeline-board";

const now = new Date("2026-08-19T12:00:00.000Z");

function card(overrides: Partial<PipelineCardRow> & Pick<PipelineCardRow, "id" | "name" | "currentStageKey">): PipelineCardRow {
  return {
    clientId: "c1",
    clientName: "Cliente",
    ownerUserId: "seed-user",
    ownerName: "Owner",
    dueDate: null,
    priority: "medium",
    status: "draft",
    currentStageLabel: overrides.currentStageKey,
    stageStatus: "in_progress",
    openBlockerCount: 0,
    waitingOnClient: false,
    ...overrides,
  };
}

describe("buildPipelineBoard", () => {
  it("coloca cada projeto só na coluna da currentStage.key", () => {
    const board = buildPipelineBoard(
      [
        card({ id: "p-brief", name: "Alpha", currentStageKey: "briefing", currentStageLabel: "Briefing" }),
        card({ id: "p-ux", name: "Beta", currentStageKey: "ux", currentStageLabel: "UX" }),
      ],
      now,
    );
    expect(board.columns).toHaveLength(10);
    expect(board.columns.map((column) => column.key)).toEqual([
      "briefing",
      "proposal",
      "waiting_client",
      "kickoff",
      "ux",
      "prototype",
      "design_handoff",
      "development",
      "staging",
      "production",
    ]);
    const briefing = board.columns.find((column) => column.key === "briefing");
    const ux = board.columns.find((column) => column.key === "ux");
    const proposal = board.columns.find((column) => column.key === "proposal");
    expect(briefing?.projects.map((project) => project.id)).toEqual(["p-brief"]);
    expect(ux?.projects.map((project) => project.id)).toEqual(["p-ux"]);
    expect(proposal?.projects).toEqual([]);
    expect(board.columns.every((column) => column.projects.every((project) => project.currentStageKey === column.key))).toBe(
      true,
    );
  });

  it("omite key que não pertence ao template SaaS", () => {
    const board = buildPipelineBoard(
      [card({ id: "p-x", name: "Fantasma", currentStageKey: "legacy_phase" })],
      now,
    );
    expect(board.columns.every((column) => column.projects.length === 0)).toBe(true);
  });

  it("ordena cards por prazo e marca overdue do envelope active", () => {
    const board = buildPipelineBoard(
      [
        card({
          id: "late",
          name: "Tarde",
          currentStageKey: "briefing",
          status: "active",
          dueDate: new Date("2026-08-01T00:00:00.000Z"),
        }),
        card({
          id: "soon",
          name: "Cedo",
          currentStageKey: "briefing",
          status: "active",
          dueDate: new Date("2026-08-10T00:00:00.000Z"),
        }),
      ],
      now,
    );
    const briefing = board.columns.find((column) => column.key === "briefing");
    expect(briefing?.projects.map((project) => project.id)).toEqual(["late", "soon"]);
    expect(briefing?.projects[0]?.visualState).toBe("overdue");
    expect(briefing?.projects[1]?.visualState).toBe("overdue");
  });
});
