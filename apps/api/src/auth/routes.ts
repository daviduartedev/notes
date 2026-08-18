import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { AppDeps } from "../deps.js";
import { loginSchema } from "./login-schema.js";
import { readLiveSession } from "./read-session.js";
import {
  encodeSession,
  SESSION_COOKIE,
  SESSION_COOKIE_ATTRS,
  SESSION_MAX_AGE,
} from "./session.js";

export function authRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.post("/login", async (c) => {
    let json: unknown;
    try {
      json = await c.req.json();
    } catch {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }

    const result = await deps.authenticate(parsed.data.email, parsed.data.password);
    if (!result) {
      return c.json({ error: "Credenciais inválidas" }, 401);
    }

    const token = await encodeSession(
      {
        sub: result.userId,
        email: result.email,
        workspaceId: result.workspaceId,
        role: result.role,
        sessionVersion: result.sessionVersion,
      },
      deps.authSecret,
    );

    setCookie(c, SESSION_COOKIE, token, {
      ...SESSION_COOKIE_ATTRS,
      maxAge: SESSION_MAX_AGE,
    });

    return c.json({ ok: true });
  });

  routes.post("/logout", async (c) => {
    const session = await readLiveSession(c, deps);
    if (session) {
      await deps.bumpSessionVersion(session.sub);
    }
    deleteCookie(c, SESSION_COOKIE, SESSION_COOKIE_ATTRS);
    return c.json({ ok: true });
  });

  return routes;
}
