# validation.md — C10 Hoje / dashboard operacional

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 176 API + 27 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rota `ƒ /hoje` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Fixture nas seções certas | `hoje/routes.test.ts` + `domain/hoje-dashboard.test.ts` | — | pass | overdue, requested, client blocker, follow-up due |
| Workspace B sem cards do A | HTTP + `persist-c10.test.ts` | — | pass | quatro seções `[]` |
| Empty por seção | HTTP arrays vazios; `hoje-copy.test.ts` | — | pass | copy por coluna, sem métricas |
| Visitante /hoje | `route-guard.test.ts` | — | pass | middleware matcher pré-existente |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c10` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + copy + SSR `ƒ /hoje`.
