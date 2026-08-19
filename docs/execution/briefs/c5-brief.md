# Brief — Cycle 05 Agent (Validações)

Você é o **Cycle 05 Agent**. Contexto limpo. Não pergunte. Não inicie C6+.

## Paths

- Workspace: `c:\dev\utopia\internal\notes`
- Cycle: `cycles/Q32026/0818-c5-validacoes/`
- Tipo: Medium (flat)
- Relatório: `docs/execution/reports/c5-report.md`

## Missão

Refine → execute → review → validate → update-spec → close → commit `cycle(05): validations` → push → execution docs.

## Herança

- C1 Project, C2 Stage, C4 Checklist (pode ligar `validationId` opcional em checklist — nullable)
- `lookupForSession`, ActivityEvent, domain machines (como project-status)
- Sem criar entidade Approval (C6)
- Sem Playwright

## Decisões fechadas

| Tópico | Decisão |
|---|---|
| Estados | `draft→requested\|cancelled`; `requested→in_review\|cancelled`; `in_review→changes_requested\|approved\|rejected`; `changes_requested→in_review\|cancelled` |
| Transições | Só via `POST /api/validations/:id/transition` — sem PATCH direto de status |
| Tipos | `prototype`, `staging`, `production`, `feature`, `delivery` |
| UI cor | roxo para validação (StatusPill tone purple) |
| `changes_requested` | não recua etapa; não cria Approval |
| Overdue | prazo vencido + status não terminal → `visualState: overdue` no DTO |
| Checklist link | se C4 entregou, permitir opcional `checklistId` na Validation; não obrigatório |

## Modelo Validation

workspaceId, projectId, stageId?, type, reviewerUserId?, requesterUserId (sessão no create), environment?, status, requestedAt?, dueDate?, items/notes (JSON ou campos texto), resultNotes?

Events: `validation.requested`, `validation.in_review`, `validation.changes_requested`, `validation.approved`, `validation.rejected`

## UI

- `/validacoes`, `/validacoes/:id`
- Seção na ficha do projeto
- Filtros: status, projeto, cliente, responsável, prazo
- Nav + middleware

## Aceite

- `in_review` → changes_requested + activity; sem Approval
- Transição ilegal rejeitada
- Overdue visual
- Isolamento workspace 404

## Commit

`cycle(05): validations`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
