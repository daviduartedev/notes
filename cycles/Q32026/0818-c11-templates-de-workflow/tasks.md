# tasks.md — Templates de workflow (C11)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: catálogo landing/institutional/saas_delivery/app/ecommerce/maintenance (grafos lineares; saas default; sem duplicar SaaS)
- [x] Prisma: `WorkflowTemplate.isDefault`; migration; seed dos 6 tipos por workspace
- [x] Store: `project.create` exige `workflowTemplateId` do mesmo workspace; cópia C2 a partir do molde escolhido
- [x] HTTP: CRUD `/api/workflow-templates`; owner muta; member GET; 401/403/404; `workspaceId` ignorado
- [x] Testes HTTP: Landing ≠ SaaS nas etapas; editar molde não altera instância; tenant B vazio/404; create sem id → 400
- [x] Persistência Postgres (`persist-c11.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: `/workflows` (owner); seletor obrigatório no create; member permission denied; pipeline colunas extras
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c11-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(11): workflow templates` + push `origin main`
