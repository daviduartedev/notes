export type ChecklistTemplateItemSnapshot = {
  title: string;
  order: number;
};

export type ChecklistTemplateSnapshot = {
  id: string;
  name: string;
  items: ChecklistTemplateItemSnapshot[];
};

export type ChecklistItemCopy = {
  title: string;
  order: number;
  completedAt: null;
  completedByUserId: null;
  note: null;
};

export type ProjectChecklistInstance = {
  name: string;
  templateId: string;
  validationId: null;
  items: ChecklistItemCopy[];
};

export function copyChecklistItemsFromTemplate(
  items: readonly ChecklistTemplateItemSnapshot[],
): ChecklistItemCopy[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      title: item.title,
      order: item.order,
      completedAt: null,
      completedByUserId: null,
      note: null,
    }));
}

export function instantiateProjectChecklist(
  template: ChecklistTemplateSnapshot,
): ProjectChecklistInstance {
  return {
    name: template.name,
    templateId: template.id,
    validationId: null,
    items: copyChecklistItemsFromTemplate(template.items),
  };
}
