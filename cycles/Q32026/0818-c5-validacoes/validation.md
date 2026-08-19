# validation.md — C5 Validações

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 114 API + 19 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rotas `ƒ /validacoes` e `ƒ /validacoes/[id]` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Ajustes solicitados + activity sem Approval | `validations/routes.test.ts`, `persist-c5.test.ts` | — | pass | event `validation.changes_requested`; briefing `in_progress` |
| Transição ilegal 409 | HTTP + persist | — | pass | draft→approved; sem event |
| Prazo vencido overdue | domínio `overdue.test.ts` + HTTP | — | pass | requested + dueDate passado |
| Terminal não overdue | HTTP approved + dueDate passado | — | pass | visualState null |
| IDOR 404 | GET/transition workspace B | — | pass | body vazio |
| Collection isolada | GET `/api/validations` B → `[]` | — | pass | |
| PATCH ignora status | HTTP draft permanece draft | — | pass | notes aplicadas |
| Checklist opcional | create com checklistId | — | pass | `validationId` no checklist |
| Visitante /validacoes | `route-guard.test.ts` | — | pass | middleware matcher |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c5` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + guard.
