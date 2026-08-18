export const WEB_PORT = 3015;

export function publicOrigin(): string {
  return `http://localhost:${WEB_PORT}`;
}
