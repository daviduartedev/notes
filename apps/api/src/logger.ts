const SENSITIVE = /password|secret|authorization|cookie|database_url|token|draftmessage|draft/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, nested]) => {
        if (SENSITIVE.test(key)) {
          return [key, "[redacted]"];
        }
        return [key, redact(nested)];
      },
    );
    return Object.fromEntries(entries);
  }
  return value;
}

export function logInfo(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.info(message, redact(meta));
    return;
  }
  console.info(message);
}
