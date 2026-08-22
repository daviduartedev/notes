import { describe, expect, it } from "vitest";
import { DASHBOARD_TITLE, HOJE_SECTION_EMPTY, HOJE_SECTION_LABELS, HOJE_SECTION_ORDER } from "./hoje-copy";

describe("copy /hoje", () => {
  it("tem quatro seções com empty state claro", () => {
    expect(HOJE_SECTION_ORDER).toEqual(["needs_attention", "today", "waiting_client", "in_progress"]);
    expect(HOJE_SECTION_LABELS.needs_attention).toBe("Precisa de atenção");
    expect(HOJE_SECTION_LABELS.today).toBe("Hoje");
    expect(HOJE_SECTION_EMPTY.needs_attention).toContain("atenção");
    expect(HOJE_SECTION_EMPTY.today).toContain("hoje");
    expect(HOJE_SECTION_EMPTY.waiting_client).toContain("cliente");
    expect(HOJE_SECTION_EMPTY.in_progress).toContain("andamento");
    expect(DASHBOARD_TITLE).toBe("Dashboard");
  });
});
