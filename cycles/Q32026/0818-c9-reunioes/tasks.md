# tasks.md — Reuniões (C9)

> Medium: tasks flat em ordem. Checkpoints humanos suspensos (ORCH-001).  
> Marcar `[x]` só com evidência (comando rodado).

## Execute

- [x] Domínio: `MEETING_TYPES` e `validateMeetingParticipants` rejeitam IDs fora do workspace
- [x] Prisma: model `Meeting` + enum `MeetingType`; migration
- [x] Store memory + prisma: list/get/create/update; nested por projeto e cliente
- [x] HTTP: POST/GET/PATCH `/api/meetings`; GET nested projeto/cliente
- [x] Testes HTTP: staging_validation com decisão na ficha + histórico; participantes externos 400; reunião não muda etapa nem cria Blocker; IDOR 404; collection B vazia
- [x] Persistência Postgres (`persist-c9.test.ts`, skip sem `DATABASE_URL`)
- [x] Web: seção Reuniões em `/projetos/:id` e `/clientes/:id`
- [x] Web: `/reunioes` e `/reunioes/:id`
- [x] Nav **Reuniões** no `AppShell`; middleware + `isProtectedPath` incluem `/reunioes`
- [x] Gate: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [x] `review.md`
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c9-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(09): meetings` + push `origin main`
