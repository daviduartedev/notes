import type {
  ChecklistItemLookup,
  ChecklistItemRecord,
  ChecklistTemplateRecord,
  ProjectChecklistRecord,
} from "../store/types.js";

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeChecklistTemplate(row: ChecklistTemplateRecord) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    key: row.key,
    name: row.name,
    description: row.description,
    items: row.items.map((item) => ({
      id: item.id,
      title: item.title,
      order: item.order,
    })),
  };
}

export function serializeChecklistItem(row: ChecklistItemRecord) {
  return {
    id: row.id,
    checklistId: row.checklistId,
    title: row.title,
    order: row.order,
    completedAt: iso(row.completedAt),
    completedByUserId: row.completedByUserId,
    completedByName: row.completedByName,
    note: row.note,
  };
}

export function serializeProjectChecklist(row: ProjectChecklistRecord) {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    projectName: row.projectName,
    stageId: row.stageId,
    templateId: row.templateId,
    name: row.name,
    validationId: row.validationId,
    items: row.items.map(serializeChecklistItem),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeChecklistItemLookup(row: ChecklistItemLookup) {
  return {
    ...serializeChecklistItem(row),
    workspaceId: row.workspaceId,
    projectId: row.projectId,
  };
}
