# tasks.md — Hoje / dashboard operacional (C10)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `buildHojeDashboard` classifica as 4 seções, limite 20, empty arrays
- [x] HTTP: `GET /api/hoje`; evaluate on-read; `workspaceId` ignorado; 401/403
- [x] Testes HTTP: fixture overdue + validação requested + blocker cliente + follow-up due nas seções certas; tenant B seções vazias
- [x] Persistência Postgres (`persist-c10.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: `/hoje` quadro de 4 seções (post-its/colunas/setas); empty copy por seção; erro de carga
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c10-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [ ] Commit `cycle(10): operational today dashboard` + push `origin main`
