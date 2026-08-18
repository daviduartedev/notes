# Stage 4 — Isolamento (API/domínio)

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 4 / 4
- **Próxima stage pode começar:** não (cycle fecha; C2 é outro cycle)

## Entrega

Vitest HTTP + persistência Postgres (sem Playwright): dois projetos no mesmo cliente, `project.created` ×2, IDOR 404 vazio, transição inválida 409, overdue no DTO.

## Evidências

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (53 API + 12 web) |
| `pnpm build` | 0 |

`persist-c1.test.ts` cobre o slice completo no Postgres.

## Blockers

Nenhum.
