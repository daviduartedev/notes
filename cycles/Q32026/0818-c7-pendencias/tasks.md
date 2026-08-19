# tasks.md — Pendências / blockers (C7)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `canDecideBlocker` / `applyBlockerDecision` cobrem open→resolved|cancelled; ilegal devolve reason; cancelar sem event
- [x] Domínio: `evaluateStageAction` rejeita `complete` com motivo pt-BR se Blocker open bloqueia a etapa/projeto; resolve **não** chama complete
- [x] Prisma: model `Blocker` + enums; `sourceMeetingId` nullable sem FK; migration
- [x] Store memory + prisma: create open; list/filtros; get; decide; auto `Stage.status=blocked` na etapa atual; resolve desbloqueia sem avançar
- [x] HTTP: POST/GET `/api/blockers`; GET por id; GET no projeto; POST decide
- [x] Testes HTTP: complete 409 com blocker open; resolve some a rejeição e etapa permanece; IDOR 404; collection B vazia; checklist distinto; copy/assigneeKind client
- [x] Persistência Postgres (`persist-c7.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: seção Pendências na ficha `/projetos/:id` + indicador
- [x] Web: `/pendencias` (filtros) e `/pendencias/:id` (decidir); pills no pipeline
- [x] Nav **Pendências** no `AppShell`; middleware + `isProtectedPath` incluem `/pendencias`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c7-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [ ] Commit `cycle(07): blockers` + push `origin main`
