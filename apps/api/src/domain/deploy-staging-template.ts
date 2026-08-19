export const DEPLOY_STAGING_TEMPLATE_KEY = "deploy_staging_saas";
export const DEPLOY_STAGING_TEMPLATE_NAME = "Deploy Staging SaaS";
export const DEPLOY_STAGING_TEMPLATE_DESCRIPTION =
  "Checklist de deploy em staging para entrega SaaS.";

export const DEPLOY_STAGING_ITEMS = [
  { title: "Environment", order: 1 },
  { title: "Migrations", order: 2 },
  { title: "API keys sandbox", order: 3 },
  { title: "Deploy", order: 4 },
  { title: "Smoke tests", order: 5 },
  { title: "Autenticação", order: 6 },
  { title: "Fluxo principal", order: 7 },
  { title: "Logs", order: 8 },
] as const;

export type DeployStagingItem = (typeof DEPLOY_STAGING_ITEMS)[number];
