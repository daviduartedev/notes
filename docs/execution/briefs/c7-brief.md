# Brief — Cycle 07 Agent (Pendências / Blockers)

Cycle 07. Não pergunte. Não inicie C8+.

Workspace: `c:\dev\utopia\internal\notes`  
Cycle: `cycles/Q32026/0818-c7-pendencias/`  
Report: `docs/execution/reports/c7-report.md`

## Decisões

- Blocker ≠ Checklist (tabela separada)
- `assigneeKind`: `internal` (userId obrigatório do workspace) | `client` (userId null)
- `blocksStageId` opcional; `blocksProject` boolean
- Status: `open|resolved|cancelled`
- Ao criar blocker na etapa atual: auto `Stage.status=blocked` **e** rejeitar `complete` enquanto open
- Resolver não avança etapa
- Integrar invariante em `domain/stage-transition.ts` (motivo pt-BR)
- `/pendencias` + filtros; indicador na ficha projeto e cards do pipeline
- Copy UI "Aguardando cliente" quando assigneeKind=client
- `sourceMeetingId` opcional nullable (para C9 futuro)

## Commit

`cycle(07): blockers`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
