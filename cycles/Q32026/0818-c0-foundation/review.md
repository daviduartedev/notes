# review.md — C0 Foundation

Revisão do cycle completo (stages 1–4) + hardening de sessão/tenant (C0 fix). Data: 2026-08-18.

## Blockers

Nenhum.

## Warnings

- Postgres Compose local usa host **5433** porque **5432** já estava alocada (`all-life-backend-db-1`). CI continua em 5432.
- Login é `POST /api/auth/login` JSON com `@auth/core/jwt`, não o callback CSRF padrão do Auth.js — necessário para CORS entre portas.

## Suggestions

- Não adicionar Playwright até o mandato ORCH-008 ser revertido.

## Escopo

Sem clientes, projetos, board, OAuth, convite, generic repository. `workspaceId` não é lido do body.

## Hardening (pós-verify)

- Middleware Next.js valida o JWT com `AUTH_SECRET` (cookie forjado → `/login`).
- Logout incrementa `User.sessionVersion`; replay do JWT antigo em `/api/me` → 401.
- `GET /api/workspace/:id` usa lookup scoped à sessão: tenant da sessão 200, outro tenant 404 vazio.
