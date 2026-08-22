export const DEFAULT_ATTENTION_LEAD_DAYS = 3;
export const MAX_ATTENTION_LEAD_DAYS = 30;
export const MANUAL_REMINDER_POLICY = "manual";

export function utcDaysUntil(target: Date, now: Date): number {
  const targetDay = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((targetDay - nowDay) / 86_400_000);
}

export function isUpcomingWithinLead(target: Date, now: Date, leadDays: number): boolean {
  if (leadDays <= 0) {
    return false;
  }
  const days = utcDaysUntil(target, now);
  return days >= 1 && days <= leadDays;
}

export function clampAttentionLeadDays(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_ATTENTION_LEAD_DAYS;
  }
  return Math.min(MAX_ATTENTION_LEAD_DAYS, Math.max(0, Math.trunc(value)));
}
