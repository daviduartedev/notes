# tasks.md — Pipeline (C3)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `buildPipelineBoard` agrupa por `currentStage.key` nas 10 colunas SaaS (ordem do template); omite key desconhecida; ordena cards por prazo
- [x] Testes de domínio: dois projetos em keys diferentes só na coluna certa; completed não entra no input do board (filtro do store); colunas sempre 10
- [x] Store: `listPipelineCards` (memory + prisma) com joins — status `draft|active|on_hold`, omitir sem etapa; filtros owner/client/priority
- [x] `GET /api/pipeline` scoped à sessão; Zod nos query params; `workspaceId` ignorado na query
- [x] Testes HTTP: agrupamento briefing vs ux; filtro `ownerUserId`; completed/cancelled ausentes; workspace B não vê cards de A (colunas vazias)
- [x] Persistência Postgres (`persist-c3.test.ts`, skip sem `DATABASE_URL`): isolamento + agrupamento
- [x] Web: `/pipeline` board horizontal, títulos Caveat, cards clicáveis para `/projetos/:id`
- [x] Filtros UI (selects responsável/cliente/prioridade) via query params
- [x] Pills overdue / blocked / waiting; empty state se não houver cards
- [x] Nav **Pipeline** no `AppShell`; middleware + `isProtectedPath` incluem `/pipeline`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c3-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(03): pipeline board` + push `origin main`
