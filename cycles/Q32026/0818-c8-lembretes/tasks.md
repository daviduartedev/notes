# tasks.md — Lembretes e follow-ups (C8)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `canDecideReminder` / `applyReminderDecision` cobrem due→done|scheduled(snooze)|cancelled e scheduled→cancelled; ilegal devolve reason; snooze default +7d
- [x] Domínio: `evaluateFollowUpPolicies` com relógio fake cria reminder se `waiting_client` + 3 dias; não cria se etapa diferente, se < 3 dias, ou se já houver scheduled/due da política
- [x] Prisma: model `Reminder` + enums; `lastInteractionAt` em Client e Project; migration
- [x] Store memory + prisma: list/get/create/decide/promote due; `listFollowUpCandidates`
- [x] `lastInteractionAt` atualizado via `recordActivity` nos events relevantes (sem draft no payload)
- [x] HTTP: GET `/api/reminders` (evaluate on-read); GET por id; GET no projeto; POST decide
- [x] Testes HTTP: política com fake clock; idempotência; complete/snooze; IDOR 404; collection B vazia; activity sem texto do draft
- [x] Persistência Postgres (`persist-c8.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: seção Lembretes na ficha `/projetos/:id`
- [x] Web: `/lembretes` e `/lembretes/:id` (copiar, enviado, adiar)
- [x] Nav **Lembretes** no `AppShell`; middleware + `isProtectedPath` incluem `/lembretes`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c8-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(08): reminders` + push `origin main`
