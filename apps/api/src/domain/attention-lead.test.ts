import { describe, expect, it } from "vitest";
import {
  DEFAULT_ATTENTION_LEAD_DAYS,
  clampAttentionLeadDays,
  isUpcomingWithinLead,
  utcDaysUntil,
} from "./attention-lead.js";

const now = new Date("2026-08-19T12:00:00.000Z");

describe("antecedência de atenção", () => {
  it("conta dias UTC até o compromisso", () => {
    expect(utcDaysUntil(new Date("2026-08-22T08:00:00.000Z"), now)).toBe(3);
    expect(utcDaysUntil(now, now)).toBe(0);
  });

  it("inclui D+1 até D+lead e exclui o próprio dia", () => {
    expect(isUpcomingWithinLead(new Date("2026-08-22T00:00:00.000Z"), now, 3)).toBe(true);
    expect(isUpcomingWithinLead(new Date("2026-08-20T00:00:00.000Z"), now, 3)).toBe(true);
    expect(isUpcomingWithinLead(now, now, 3)).toBe(false);
    expect(isUpcomingWithinLead(new Date("2026-08-23T00:00:00.000Z"), now, 3)).toBe(false);
  });

  it("lead 0 não antecipa", () => {
    expect(isUpcomingWithinLead(new Date("2026-08-22T00:00:00.000Z"), now, 0)).toBe(false);
    expect(DEFAULT_ATTENTION_LEAD_DAYS).toBe(3);
  });

  it("limita o valor persistido", () => {
    expect(clampAttentionLeadDays(3.9)).toBe(3);
    expect(clampAttentionLeadDays(-1)).toBe(0);
    expect(clampAttentionLeadDays(99)).toBe(30);
  });
});
