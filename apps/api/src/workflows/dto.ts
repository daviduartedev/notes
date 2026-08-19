import { isCatalogWorkflowKey } from "../domain/workflow-catalog.js";
import type { WorkflowTemplateRecord } from "../store/types.js";

export function serializeWorkflowTemplate(row: WorkflowTemplateRecord) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    key: row.key,
    name: row.name,
    isDefault: row.isDefault,
    isCatalog: isCatalogWorkflowKey(row.key),
    stages: row.stages.map((stage) => ({
      id: stage.id,
      key: stage.key,
      label: stage.label,
      phase: stage.phase,
      order: stage.order,
      allowedNextKeys: [...stage.allowedNextKeys],
      entryCriteria: stage.entryCriteria,
      exitCriteria: stage.exitCriteria,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
