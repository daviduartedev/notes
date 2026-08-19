# validation.md — C8 Lembretes e follow-ups

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 159 API + 25 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rotas `ƒ /lembretes` e `ƒ /lembretes/[id]` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Política dos 3 dias cria reminder | `follow-up-policy.test.ts` (fake clock), `reminders/routes.test.ts`, `persist-c8.test.ts` | — | pass | `waiting_client` + 3d → due, channel internal |
| Política não dispara cedo nem duplica | HTTP GET cedo `[]`; segundo GET mesmo id | — | pass | relógio fake |
| Marcar enviado e adiar | HTTP complete → done; snooze → scheduled +7d | — | pass | DEFAULT_SNOOZE_MS |
| Draft não vai para o log | activity `reminder.created` sem draftMessage | — | pass | sanitizer |
| Nada enviado para fora | channel `internal`; sem integração | — | pass | |
| Decisão ilegal 409 | done → complete | — | pass | um só `reminder.completed` |
| IDOR 404 | GET/decide workspace B | — | pass | body vazio |
| Collection isolada | GET `/api/reminders` B → `[]` | — | pass | |
| Visitante /lembretes | `route-guard.test.ts` | — | pass | middleware matcher |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c8` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + guard.
