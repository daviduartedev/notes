# Brief — Cycle 08 Agent (Lembretes)

Cycle 08. Não pergunte. Não inicie C9+.

Workspace: `c:\dev\utopia\internal\notes`  
Cycle: `cycles/Q32026/0818-c8-lembretes/`  
Report: `docs/execution/reports/c8-report.md`

## Decisões

- `channel=internal` only
- Política nomeada `proposalWaitingClientFollowUp`: projeto em etapa `waiting_client` + `lastInteractionAt` > 3 dias → criar Reminder (relógio injetável)
- Avaliação: **on-read** de `GET /api/reminders` chama `evaluateFollowUpPolicies(now)` antes de listar
- Estados: `scheduled→due→done|snoozed|cancelled`; snooze → scheduled com nova data
- Draft message template pt-BR para proposta (não logar texto completo)
- Atualizar `lastInteractionAt` em client/project em events relevantes (client.updated, project.updated, stage.transitioned, etc.)
- UI: copiar draft, marcar enviado (done), adiar (snooze +7 dias default)
- `/lembretes` + nav

## Commit

`cycle(08): reminders`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
