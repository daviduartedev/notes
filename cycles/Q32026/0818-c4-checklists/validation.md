# validation.md — C4 Checklists

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 94 API + 17 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rota `ƒ /checklists` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Mesmo template em dois projetos | `checklists/routes.test.ts`, `persist-c4.test.ts` | — | pass | 8 itens, ids independentes |
| Mutar o template não altera instâncias | HTTP memória + Postgres PATCH molde | — | pass | título Environment permanece |
| Marcar item registra responsável e data | `checklist-item.test.ts` + HTTP `completedByUserId` | — | pass | event `checklist.item_completed` |
| Completar item não muda Stage.status | HTTP: briefing continua `in_progress` | — | pass | domínio sem Stage |
| IDOR em item de outro workspace | PATCH workspace B → 404 vazio | — | pass | |
| Collection isolada | GET `/api/checklists` B → `[]` | — | pass | sem 404 |
| Member não edita template | PATCH template com member → 403 | — | pass | apply/marcar permitidos |
| Apply gera event | `checklist.applied` no activity do projeto | — | pass | |
| Visitante não entra em /checklists | `route-guard.test.ts` | — | pass | middleware matcher `/checklists` |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina o teste C4 Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + href + seção na ficha + guard.
