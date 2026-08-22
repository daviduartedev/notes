import { describe, expect, it } from "vitest";
import { groupByPhase, timelineNodeState } from "./stage-timeline";

describe("timelineNodeState", () => {
  it("prioriza bloqueio e espera sobre a etapa atual", () => {
    expect(timelineNodeState({ status: "blocked", isCurrent: true })).toBe("blocked");
    expect(timelineNodeState({ status: "waiting", isCurrent: true })).toBe("waiting");
  });

  it("marca concluída, pulada, atual e futura", () => {
    expect(timelineNodeState({ status: "completed" })).toBe("completed");
    expect(timelineNodeState({ status: "skipped" })).toBe("skipped");
    expect(timelineNodeState({ status: "in_progress" })).toBe("current");
    expect(timelineNodeState({ status: "pending", isCurrent: true })).toBe("current");
    expect(timelineNodeState({ status: "pending" })).toBe("upcoming");
  });

  it("usa trabalho na coluna quando não há status de instância", () => {
    expect(timelineNodeState({ hasWork: true })).toBe("current");
    expect(timelineNodeState({})).toBe("idle");
  });
});

describe("groupByPhase", () => {
  it("agrupa etapas consecutivas da mesma fase", () => {
    const groups = groupByPhase(
      [
        { key: "briefing", phase: "commercial" as const },
        { key: "proposal", phase: "commercial" as const },
        { key: "ux", phase: "design" as const },
      ],
      (item) => item.phase,
    );
    expect(groups).toHaveLength(2);
    expect(groups[0]?.label).toBe("Comercial");
    expect(groups[0]?.items.map((item) => item.key)).toEqual(["briefing", "proposal"]);
    expect(groups[1]?.label).toBe("Design");
  });
});
