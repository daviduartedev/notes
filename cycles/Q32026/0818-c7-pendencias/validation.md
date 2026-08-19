# validation.md — C7 Pendências / blockers

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 144 API + 23 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rotas `ƒ /pendencias` e `ƒ /pendencias/[id]` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Blocker open impede complete | `blockers/routes.test.ts`, `stage-transition.test.ts`, `persist-c7.test.ts` | — | pass | motivo pt-BR; Stage.blocked |
| Resolver desbloqueia sem avançar | HTTP + persist currentStageKey briefing | — | pass | complete volta a 200 |
| assigneeKind client | HTTP userId forjado → null + copy | — | pass | `Aguardando cliente` |
| Blocker ≠ checklist | HTTP apply + create; item não recebe o título | — | pass | tabelas distintas |
| Decisão ilegal 409 | resolved → resolve | — | pass | um só `blocker.resolved` |
| IDOR 404 | GET/decide workspace B | — | pass | body vazio |
| Collection isolada | GET `/api/blockers` B → `[]` | — | pass | |
| Visitante /pendencias | `route-guard.test.ts` | — | pass | middleware matcher |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c7` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + guard.
