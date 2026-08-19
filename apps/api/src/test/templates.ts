type AppLike = {
  request: (url: string, init?: RequestInit) => Promise<Response> | Response;
};

export async function workflowTemplateIdOf(
  app: AppLike,
  cookie: string,
  key = "saas_delivery",
): Promise<string> {
  const response = await app.request("/api/workflow-templates", { headers: { cookie } });
  const rows = (await response.json()) as Array<{ id: string; key: string }>;
  const found = rows.find((row) => row.key === key);
  if (!found) {
    throw new Error(`template ${key} ausente`);
  }
  return found.id;
}
