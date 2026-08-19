import { describe, expect, it } from "vitest";
import { DEPLOY_STAGING_ITEMS } from "./deploy-staging-template";

describe("seed Deploy Staging SaaS", () => {
  it("tem oito itens na ordem do brief", () => {
    expect(DEPLOY_STAGING_ITEMS).toHaveLength(8);
    expect(DEPLOY_STAGING_ITEMS.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
