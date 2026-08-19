# tasks.md — Aprovações (C6)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `canDecideApproval` / `applyApprovalDecision` cobrem pending→granted|rejected|cancelled e granted→revoked; ilegal devolve reason; cancelar sem event
- [x] Domínio: apply **não** recebe nem altera Stage
- [x] Prisma: model `Approval` + enums; snapshot JSON; `validationId` nullable; migration
- [x] Store memory + prisma: create pending com snapshot server-side; list/filtros; get; decide (approver da sessão); revoke sem DELETE
- [x] HTTP: POST/GET `/api/approvals`; GET por id; GET no projeto; POST decide
- [x] Testes HTTP: kind=staging grava approver/timestamp/snapshot; approverId do body ignorado; revoke não apaga; 409 ilegal; IDOR 404; collection B vazia; grant não muda Stage; Validation.approved não cria Approval
- [x] Persistência Postgres (`persist-c6.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: seção Aprovações na ficha `/projetos/:id`
- [x] Web: `/aprovacoes` (filtros) e `/aprovacoes/:id` (decidir)
- [x] Nav **Aprovações** no `AppShell`; middleware + `isProtectedPath` incluem `/aprovacoes`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c6-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(06): approvals` + push `origin main`
