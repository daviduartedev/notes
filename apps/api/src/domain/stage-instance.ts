import type { StageTemplateSnapshot } from "./saas-delivery-template.js";
import type { StageStatus } from "./types.js";

export type StageSnapshot = {
  id: string;
  key: string;
  label: string;
  phase: StageTemplateSnapshot["phase"];
  order: number;
  allowedNextKeys: string[];
  entryCriteria: string;
  exitCriteria: string;
  status: StageStatus;
};

export function copyStageFromTemplate(template: StageTemplateSnapshot): Omit<
  StageSnapshot,
  "id" | "status"
> {
  return {
    key: template.key,
    label: template.label,
    phase: template.phase,
    order: template.order,
    allowedNextKeys: [...template.allowedNextKeys],
    entryCriteria: template.entryCriteria,
    exitCriteria: template.exitCriteria,
  };
}

export function instantiateProjectStages(
  templates: readonly StageTemplateSnapshot[],
  newId: () => string = () => crypto.randomUUID(),
): { stages: StageSnapshot[]; currentStageId: string } {
  const sorted = [...templates].sort((a, b) => a.order - b.order);
  const stages = sorted.map((template, index) => ({
    id: newId(),
    ...copyStageFromTemplate(template),
    status: (index === 0 ? "in_progress" : "pending") as StageStatus,
  }));
  const current = stages[0];
  if (!current) {
    throw new Error("Template sem etapas");
  }
  return { stages, currentStageId: current.id };
}
