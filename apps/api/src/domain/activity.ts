const FORBIDDEN_KEYS = new Set([
  "whatsapp",
  "email",
  "phone",
  "telefone",
  "e-mail",
  "e_mail",
]);

export function sanitizeActivityPayload(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = sanitizeActivityPayload(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}
