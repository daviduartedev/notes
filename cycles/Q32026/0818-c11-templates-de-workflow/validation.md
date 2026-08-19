# validation.md — C11 Templates de workflow

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 187 API + 29 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rota `ƒ /workflows` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Landing ≠ SaaS | `workflows/routes.test.ts` + `domain/workflow-catalog.test.ts` | — | pass | 4 vs 10 etapas |
| Editar molde não altera instância | HTTP PATCH + GET ficha; `persist-c11.test.ts` | — | pass | arestas copiadas |
| Create exige template | POST sem id 400; id de B 404 | — | pass | |
| Owner edita / member só lista | member GET 200; POST/PATCH/DELETE 403 | — | pass | |
| Workspace B sem templates do A | collection + GET id 404 | — | pass | persist-c11 |
| Sem canvas | `workflow-copy.test.ts` | — | pass | copy formulário |
| Visitante /workflows | `route-guard.test.ts` | — | pass | middleware matcher |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c11` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + copy + SSR `ƒ /workflows`.
