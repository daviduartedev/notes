# Stage 1 — Repo, Harness, CI

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 1 / 4
- **Próxima stage pode começar:** sim

## Entrega

Monorepo pnpm (web :3015, api :3014), TypeScript strict, ESLint, Vitest, Docker Compose Postgres 16, `.env.example`, GitHub Actions, specs de processo em `spec/`, comandos SDD em `.cursor/commands/`.

## Evidências

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (3 testes) |
| `pnpm build` | 0 |

## Desvios

- `db:migrate` / `db:seed` ainda são stubs até a Stage 4 (Prisma).
- Playwright não foi adicionado (ORCH-008).
- `/create-issue` e `/open-pr` não portados (ORCH-009).

## Blockers

Nenhum.

## Escopo

Sem auth real, sem Prisma models, sem `/hoje`, sem primitivos visuais além do canvas base.
