# validation.md — C6 Aprovações

Data: 2026-08-19. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 128 API + 21 web |
| `pnpm build` | pass | 0 | Next.js 15.5; rotas `ƒ /aprovacoes` e `ƒ /aprovacoes/[id]` |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Grant staging + snapshot | `approvals/routes.test.ts`, `persist-c6.test.ts` | — | pass | approver da sessão; snapshot briefing |
| approverId body ignorado | HTTP grant com approverId forjado | — | pass | gravado `seed-user` / userA |
| Revoke não apaga | HTTP + persist mesmo id revoked | — | pass | decidedAt/snapshot intactos |
| Decisão ilegal 409 | pending → revoke | — | pass | sem event |
| Grant não avança etapa | HTTP + persist briefing in_progress | — | pass | |
| D8 validação approved | HTTP lista `/api/approvals` vazia | — | pass | event `validation.approved` só |
| IDOR 404 | GET/decide workspace B | — | pass | body vazio |
| Collection isolada | GET `/api/approvals` B → `[]` | — | pass | |
| Visitante /aprovacoes | `route-guard.test.ts` | — | pass | middleware matcher |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. Nesta máquina `persist-c6` Postgres rodou (exit 0).
- Sem Playwright; aceite de UI coberto por DTO + rotas + guard.
