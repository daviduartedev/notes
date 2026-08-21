/** No browser, use same-origin `/api` (rewrite → backend). No servidor, chama a API direto. */
export const API_ORIGIN =
  typeof window === "undefined"
    ? (process.env.API_ORIGIN ??
      process.env.NEXT_PUBLIC_API_ORIGIN ??
      "http://localhost:3014")
    : "";

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; data: T | null; text: string }> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  const text = await response.text();
  if (!text) {
    return { status: response.status, data: null, text };
  }
  try {
    return { status: response.status, data: JSON.parse(text) as T, text };
  } catch {
    return { status: response.status, data: null, text };
  }
}
