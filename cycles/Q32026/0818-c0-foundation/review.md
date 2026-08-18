# review.md — C0 Foundation

Revisão do cycle completo (stages 1–4). Data: 2026-08-18.

## Blockers

Nenhum.

## Warnings

- Middleware do Next.js só verifica **presença** do cookie `authjs.session-token`. A assinatura JWT é validada na API. Cookie forjado passa no web até a primeira chamada à API.
- Postgres Compose local usa host **5433** porque **5432** já estava alocada (`all-life-backend-db-1`). CI continua em 5432.
- Login é `POST /api/auth/login` JSON com `@auth/core/jwt`, não o callback CSRF padrão do Auth.js — necessário para CORS entre portas.

## Suggestions

- C1: validar JWT no middleware (mesmo `AUTH_SECRET`) se o web passar a renderizar dados no server.
- Não adicionar Playwright até o mandato ORCH-008 ser revertido.

## Escopo

Sem clientes, projetos, board, OAuth, convite, generic repository. `workspaceId` não é lido do body.
