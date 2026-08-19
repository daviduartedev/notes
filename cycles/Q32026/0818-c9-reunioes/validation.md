# validation.md — C9 Reuniões

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 169 API + 27 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rotas `ƒ /reunioes` e `ƒ /reunioes/[id]` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Reunião staging na ficha e histórico | `meetings/routes.test.ts` | — | pass | `meeting.created` sem notas/decisões |
| Participantes externos rejeitados | HTTP 400 + reason; lista vazia | — | pass | `Participante fora do workspace` |
| Reunião não altera etapa nem abre pendência | ficha briefing in_progress; blockers `[]` | — | pass | |
| IDOR 404 | GET/PATCH workspace B | — | pass | body vazio |
| Collection isolada | GET `/api/meetings` B → `[]` | — | pass | |
| Visitante /reunioes | `route-guard.test.ts` | — | pass | middleware matcher |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c9` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + guard.
