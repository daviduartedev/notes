import { SAAS_DELIVERY_NAME, SAAS_DELIVERY_STAGES } from "../domain/saas-delivery-template.js";
import type { StagePhase } from "../domain/types.js";

export type SaasTemplateRow = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
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
    }) => Promise<SaasTemplateRow | null>;
    create: (args: {
      data: {
        workspaceId: string;
        key: string;
        name: string;
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
    }) => Promise<SaasTemplateRow>;
  };
};

export async function ensureSaasDeliveryForWorkspace(
  db: TemplateDb,
  workspaceId: string,
): Promise<SaasTemplateRow> {
  const existing = await db.workflowTemplate.findUnique({
    where: { workspaceId_key: { workspaceId, key: "saas_delivery" } },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  if (existing && existing.stages.length === SAAS_DELIVERY_STAGES.length) {
    return existing;
  }
  if (existing) {
    return existing;
  }
  return db.workflowTemplate.create({
    data: {
      workspaceId,
      key: "saas_delivery",
      name: SAAS_DELIVERY_NAME,
      stages: {
        create: SAAS_DELIVERY_STAGES.map((stage) => ({
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
  });
}
