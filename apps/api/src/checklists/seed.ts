import {
  DEPLOY_STAGING_ITEMS,
  DEPLOY_STAGING_TEMPLATE_DESCRIPTION,
  DEPLOY_STAGING_TEMPLATE_KEY,
  DEPLOY_STAGING_TEMPLATE_NAME,
} from "../domain/deploy-staging-template.js";

export type ChecklistTemplateRow = {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string | null;
  items: Array<{
    id: string;
    title: string;
    order: number;
  }>;
};

type TemplateDb = {
  checklistTemplate: {
    findUnique: (args: {
      where: { workspaceId_key: { workspaceId: string; key: string } };
      include: { items: { orderBy: { order: "asc" } } };
    }) => Promise<ChecklistTemplateRow | null>;
    create: (args: {
      data: {
        workspaceId: string;
        key: string;
        name: string;
        description: string | null;
        items: {
          create: Array<{ title: string; order: number }>;
        };
      };
      include: { items: { orderBy: { order: "asc" } } };
    }) => Promise<ChecklistTemplateRow>;
  };
};

export async function ensureDeployStagingForWorkspace(
  db: TemplateDb,
  workspaceId: string,
): Promise<ChecklistTemplateRow> {
  const existing = await db.checklistTemplate.findUnique({
    where: { workspaceId_key: { workspaceId, key: DEPLOY_STAGING_TEMPLATE_KEY } },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (existing && existing.items.length === DEPLOY_STAGING_ITEMS.length) {
    return existing;
  }
  if (existing) {
    return existing;
  }
  return db.checklistTemplate.create({
    data: {
      workspaceId,
      key: DEPLOY_STAGING_TEMPLATE_KEY,
      name: DEPLOY_STAGING_TEMPLATE_NAME,
      description: DEPLOY_STAGING_TEMPLATE_DESCRIPTION,
      items: {
        create: DEPLOY_STAGING_ITEMS.map((item) => ({
          title: item.title,
          order: item.order,
        })),
      },
    },
    include: { items: { orderBy: { order: "asc" } } },
  });
}
