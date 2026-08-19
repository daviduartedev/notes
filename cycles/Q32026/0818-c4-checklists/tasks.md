# tasks.md — Checklists (C4)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `instantiateProjectChecklist` copia name/itens por valor; mutar template depois não altera a cópia
- [x] Domínio: seed `Deploy Staging SaaS` com 8 itens na ordem do brief
- [x] Domínio: `applyChecklistItemState` grava responsável + `completedAt`; desmarcar limpa; **não** recebe/altera `Stage.status`
- [x] Prisma: `ChecklistTemplate`, `ChecklistTemplateItem`, `ProjectChecklist`, `ChecklistItem` (`validationId` nullable); migration
- [x] Store memory + prisma: ensure seed, apply deep copy, list, patch item, patch template (owner via HTTP)
- [x] Seed CLI: `ensureDeployStagingForWorkspace` no `seed.ts`
- [x] HTTP: `GET /api/checklist-templates`; `POST .../checklists/apply`; `GET` project/workspace; `PATCH` item; `PATCH` template owner-only
- [x] Testes HTTP: mesmo template em 2 projetos; mutar molde; item completedBy/completedAt; IDOR 404; member 403 no template; completar item não muda `Stage.status`; collection B vazia
- [x] Persistência Postgres (`persist-c4.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: seção Checklists na ficha `/projetos/:id` (apply + marcar item)
- [x] Web: `/checklists` lista instâncias do workspace
- [x] Nav **Checklists** no `AppShell`; middleware + `isProtectedPath` incluem `/checklists`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c4-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(04): checklists` + push `origin main`
