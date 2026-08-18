# implementation-notes.md — C0 Foundation

Diário técnico.

## Stage 1

- **Status:** done
- **Arquivos:** monorepo pnpm (`apps/web`, `apps/api`), `spec/*.md` de processo, `.cursor/commands/`, `docker-compose.yml`, `.github/workflows/ci.yml`, `.env.example`
- **Comandos:** `pnpm lint/typecheck/test/build` exit 0
- **Riscos / desvios:** Playwright não incluído (ORCH-008). Postgres local na **5433** (5432 ocupada por outro container). CI usa 5432.

## Stage 2

- **Status:** done
- **Arquivos:** tokens CSS, Caveat + IBM Plex Sans, primitivos Button/Input/Card/StatusPill, `/login`, `/design-system`
- **Comandos:** gates exit 0
- **Riscos / desvios:** `/design-system` 404 em production via `NODE_ENV` (testado unitariamente).

## Stage 3

- **Status:** done
- **Arquivos:** `@auth/core/jwt` encode/decode, `POST /api/auth/login|logout`, CORS credentials, middleware Next (`/hoje` → `/login`)
- **Comandos:** testes de sessão e route-guard verdes
- **Riscos / desvios:** login JSON custom (sem CSRF Auth.js) para CORS entre 3015/3014. Middleware valida presença do cookie, não a assinatura (API valida JWT).

## Stage 4

- **Status:** done
- **Arquivos:** Prisma User/Workspace/Member, seed, `GET /health|/api/me|/api/workspace`, `/hoje` empty state, logger redacted
- **Comandos:** `pnpm db:migrate` + `pnpm db:seed` exit 0; persistência Postgres 1 teste; smoke `GET :3014/health` 200; visitante `/hoje` 307 `/login`
- **Riscos / desvios:** Prisma **6.16.3** (Prisma 7 quebra `url` no schema). `pnpm.onlyBuiltDependencies` para engines do Prisma.
