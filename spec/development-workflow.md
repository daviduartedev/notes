# spec/development-workflow.md

## Stack

- Monorepo **pnpm** (Node 22)
- `apps/web` — Next.js App Router, porta **3015**
- `apps/api` — Hono + Prisma + Auth.js, porta **3014**
- PostgreSQL 16 via `docker-compose.yml`

## Scripts raiz

| Script | Função |
|--------|--------|
| `pnpm dev` | web + api em paralelo |
| `pnpm dev:web` | Next.js :3015 |
| `pnpm dev:api` | Hono :3014 |
| `pnpm lint` | ESLint em todos os packages |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest |
| `pnpm build` | build de todos os packages |
| `pnpm db:migrate` | Prisma migrate |
| `pnpm db:seed` | seed do owner/workspace |

## Fluxo SDD

```text
request.md → refine → plan.md + tasks.md + scenarios.feature + spec-delta.md
 → execute (Large: uma stage por vez)
 → review → validate → update-spec → close
```

Comandos em `.cursor/commands/`. Índice de cycles: `cycles/README.md`.

## Gates

Todo cycle precisa evidência real de:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`

Não há Playwright/Cypress nesta execução (ORCH-008).

## Portas

Não usar 3000, 3001, 5173 ou 8080 como portas principais. Health na API (`GET /health`). Postgres Compose local: host **5433**; CI: **5432**.
