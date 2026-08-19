import { ensureWorkflowCatalogForWorkspace, type WorkflowTemplateRow } from "../workflows/seed.js";

export type SaasTemplateRow = WorkflowTemplateRow;

export async function ensureSaasDeliveryForWorkspace(
  db: Parameters<typeof ensureWorkflowCatalogForWorkspace>[0],
  workspaceId: string,
): Promise<SaasTemplateRow> {
  const rows = await ensureWorkflowCatalogForWorkspace(db, workspaceId);
  const saas = rows.find((row) => row.key === "saas_delivery");
  if (!saas) {
    throw new Error("template saas_delivery ausente");
  }
  return saas;
}
