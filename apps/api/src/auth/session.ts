import { decode, encode } from "@auth/core/jwt";

export const SESSION_COOKIE = "authjs.session-token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type MemberRole = "owner" | "member";

export type SessionPayload = {
  sub: string;
  email: string;
  workspaceId: string | null;
  role: MemberRole | null;
};

export async function encodeSession(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  return encode({
    token: payload,
    secret,
    salt: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE,
  });
}

export async function decodeSession(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  try {
    const decoded = await decode({
      token,
      secret,
      salt: SESSION_COOKIE,
    });
    if (!decoded || typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
      return null;
    }
    const workspaceId =
      typeof decoded.workspaceId === "string" ? decoded.workspaceId : null;
    const role = decoded.role === "owner" || decoded.role === "member" ? decoded.role : null;
    return {
      sub: decoded.sub,
      email: decoded.email,
      workspaceId,
      role,
    };
  } catch {
    return null;
  }
}
