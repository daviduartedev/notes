# tasks.md — Validações (C5)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `canTransitionValidation` / `applyValidationTransition` cobrem a matriz do brief; ilegal devolve reason; cancelar sem event
- [x] Domínio: `validationVisualState` overdue só se prazo vencido e status não terminal
- [x] Domínio: apply **não** recebe nem altera Stage; **não** cria Approval
- [x] Prisma: model `Validation` + enums; `checklistId` nullable; migration
- [x] Store memory + prisma: create (draft), list/filtros, get, patch sem status, transition, link `validationId` no checklist
- [x] HTTP: POST/GET projeto; GET lista/ficha; PATCH; POST transition
- [x] Testes HTTP: `in_review` → `changes_requested` + activity; ilegal 409; overdue; IDOR 404; collection B vazia; PATCH status ignorado; checklist opcional; stage intacta; sem `approval.*`
- [x] Persistência Postgres (`persist-c5.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: seção Validações na ficha `/projetos/:id`
- [x] Web: `/validacoes` (filtros) e `/validacoes/:id` (transições)
- [x] Nav **Validações** no `AppShell`; middleware + `isProtectedPath` incluem `/validacoes`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c5-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(05): validations` + push `origin main`
