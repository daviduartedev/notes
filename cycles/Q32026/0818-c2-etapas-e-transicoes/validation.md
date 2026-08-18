# validation.md — C2 Etapas e transições

Data: 2026-08-18. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 72 testes API + 13 web |
| `pnpm build` | pass | 0 | Next.js 15.5 + tsc api |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |
| `prisma migrate deploy` | pass | 0 | `20260818250000_stages` |
| `pnpm db:seed` | pass | 0 | template SaaS + backfill |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Projeto novo copia as 10 etapas | `stages.routes.test.ts`, `persist-c2.test.ts` | — | pass | primeira `in_progress` |
| Avançar etapa válida + de/para | domínio + HTTP `ux` → `prototype` | — | pass | payload `stage.transitioned` |
| Pulo ilegal | briefing → kickoff 409 sem event | — | pass | memória + Postgres |
| Etapa blocked não completa | HTTP + domínio | — | pass | |
| Etapa concluída terminal | `stage-transition.test.ts` production | — | pass | |
| Isolamento entre workspaces | transição IDOR 404 vazio | — | pass | |
| Template editado não reescreve instâncias | store update template + GET | — | pass | |
| Uma etapa atual por projeto | instantiate + assertSingleCurrentStage | — | pass | |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. CI aplica migrate + service Postgres.
- Sem Playwright; aceite de UI coberto por DTO `actions[].reason` e labels.
