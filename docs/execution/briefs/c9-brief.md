# Brief — Cycle 09 Agent (Reuniões)

Cycle 09. Não pergunte. Não inicie C10+.

Workspace: `c:\dev\utopia\internal\notes`  
Cycle: `cycles/Q32026/0818-c9-reunioes/`  
Report: `docs/execution/reports/c9-report.md`

## Decisões

- Lista `/reunioes` **sim** (Medium)
- Tipos: `kickoff`, `scope_alignment`, `prototype_review`, `staging_validation`, `production_validation`, `delivery`
- `validationId` opcional se C5 existe (link)
- Participantes: array de userIds do workspace; rejeitar IDs externos
- `sourceMeetingId` em Blocker já nullable (C7) — não gerar blockers auto
- Event `meeting.created`
- Reunião não altera etapa
- Seção na ficha cliente/projeto

## Commit

`cycle(09): meetings`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
