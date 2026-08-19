import { WORKFLOW_CATALOG } from "../domain/workflow-catalog.js";
import type { StagePhase } from "../domain/types.js";

export type WorkflowTemplateRow = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  stages: Array<{
    id: string;
    key: string;
    label: string;
    phase: StagePhase;
    order: number;
    allowedNextKeys: unknown;
    entryCriteria: string;
    exitCriteria: string;
  }>;
};

type TemplateDb = {
  workflowTemplate: {
    findUnique: (args: {
      where: { workspaceId_key: { workspaceId: string; key: string } };
      include: { stages: { orderBy: { order: "asc" } } };
    }) => Promise<WorkflowTemplateRow | null>;
    create: (args: {
      data: {
        workspaceId: string;
        key: string;
        name: string;
        isDefault: boolean;
        stages: {
          create: Array<{
            key: string;
            label: string;
            phase: StagePhase;
            order: number;
            allowedNextKeys: string[];
            entryCriteria: string;
            exitCriteria: string;
          }>;
        };
      };
      include: { stages: { orderBy: { order: "asc" } } };
    }) => Promise<WorkflowTemplateRow>;
    update: (args: {
      where: { id: string };
      data: { isDefault: boolean };
    }) => Promise<{ id: string }>;
  };
};

export async function ensureWorkflowCatalogForWorkspace(
  db: TemplateDb,
  workspaceId: string,
): Promise<WorkflowTemplateRow[]> {
  const rows: WorkflowTemplateRow[] = [];
  for (const item of WORKFLOW_CATALOG) {
    const existing = await db.workflowTemplate.findUnique({
      where: { workspaceId_key: { workspaceId, key: item.key } },
      include: { stages: { orderBy: { order: "asc" } } },
    });
    if (existing) {
      if (item.isDefault && !existing.isDefault) {
        await db.workflowTemplate.update({
          where: { id: existing.id },
          data: { isDefault: true },
        });
        existing.isDefault = true;
      }
      rows.push(existing);
      continue;
    }
    rows.push(
      await db.workflowTemplate.create({
        data: {
          workspaceId,
          key: item.key,
          name: item.name,
          isDefault: item.isDefault,
          stages: {
            create: item.stages.map((stage) => ({
              key: stage.key,
              label: stage.label,
              phase: stage.phase,
              order: stage.order,
              allowedNextKeys: [...stage.allowedNextKeys],
              entryCriteria: stage.entryCriteria,
              exitCriteria: stage.exitCriteria,
            })),
          },
        },
        include: { stages: { orderBy: { order: "asc" } } },
      }),
    );
  }
  return rows;
}
