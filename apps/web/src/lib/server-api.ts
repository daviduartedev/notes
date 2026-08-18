import { cookies } from "next/headers";
import { API_ORIGIN } from "./api";

export async function serverApi<T>(
  path: string,
): Promise<{ status: number; data: T | null; text: string }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
  const response = await fetch(`${API_ORIGIN}${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
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
