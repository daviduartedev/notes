# validation.md — C3 Pipeline

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 83 API + 15 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rota `ƒ /pipeline` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Dois projetos em etapas diferentes | `pipeline-board.test.ts`, `pipeline/routes.test.ts`, `persist-c3.test.ts` | — | pass | briefing vs ux / proposal |
| Isolamento entre workspaces | HTTP memória + Postgres: B vê colunas vazias | — | pass | collection, sem 404 |
| Envelope completed some do quadro | `routes.test.ts` PATCH completed | — | pass | cancelled pelo mesmo filtro de status |
| Projeto sem etapa atual | `updateProject` currentStageId null | — | pass | |
| Filtro por responsável | `?ownerUserId=seed-user` | — | pass | workspaceId na query ignorado |
| Card leva à ficha | `pipelineCardHref` | — | pass | sem Playwright; click-only |
| Visitante não entra em /pipeline | `route-guard.test.ts` | — | pass | middleware matcher `/pipeline` |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina o teste C3 Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + href + guard.
