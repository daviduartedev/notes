# C0 fix — sessão e tenant

- **Cycle:** `cycles/Q32026/0818-c0-foundation/`
- **Data:** 2026-08-18
- **Commit:** `cycle(00): harden session and tenant lookup`
- **SHA:** `173781ee960650f3697a445cea17bb8355071d22`
- **C1:** não iniciado

```txt
STATUS: PASS
```

## Important

1. **JWT no middleware.** `verifySessionToken` usa `@auth/core/jwt` e o mesmo `AUTH_SECRET`. Cookie forjado ou assinatura inválida → redirect `/login`. Testes em `apps/web/src/lib/session-token.test.ts`.
2. **Logout revoga no servidor.** `User.sessionVersion` vai no JWT no login; `POST /api/auth/logout` incrementa a versão. `GET /api/me` com JWT antigo → 401. Coberto em `app.test.ts` e `persist.test.ts`.
3. **Cross-tenant 404 real.** `lookupForSession` nas rotas. `GET /api/workspace/:id`: workspace da sessão → 200; fixture B / tenant B → 404 body vazio. HTTP em `app.test.ts` e Postgres em `persist.test.ts`.

## Minors

- Vitest da copy `/hoje` (`HOJE_EMPTY_STATE`)
- HTTP 403 em `GET /api/workspace` sem membership
- Após logout: cookie jar e replay do JWT falham em `/api/me`
- `deleteCookie` com `httpOnly` / `sameSite=Lax` iguais ao set
- `plan.md`: Postgres local **5433**, CI **5432**

## Gates

| Gate | Exit |
|------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (22 API + 11 web) |
| `pnpm build` | 0 |

`pnpm build` da web emitiu warning de Edge (`jose` CompressionStream via `@auth/core/jwt` no middleware). Compilação e páginas OK; não falha o gate.

## Docs

Atualizados: `review.md`, `validation.md`, `implementation-notes.md`, `spec/security.md`, `spec/backend.md`, `spec/database.md`, `spec/frontend.md`, `spec/features/auth/readme.md`, `spec/features/workspace/readme.md`.
