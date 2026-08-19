# Validações

Validação **verifica** algo antes de avançar. Não é Approval (C6). `Validation.status === approved` não cria entidade de aprovação.

## Status

`draft | requested | in_review | changes_requested | approved | rejected | cancelled`.

Transições: `draft→requested|cancelled`; `requested→in_review|cancelled`; `in_review→changes_requested|approved|rejected`; `changes_requested→in_review|cancelled`. `approved`, `rejected` e `cancelled` são terminais. Transição inválida → **409** sem event.

Create sempre inicia em `draft`. `requesterUserId` vem da sessão. Tipos: `prototype | staging | production | feature | delivery`.

## Overdue

Se o status **não** é terminal e `dueDate < now`, o DTO inclui `visualState: "overdue"`. Caso contrário `null`.

## Checklist

`checklistId` opcional (instância do mesmo projeto). Preenche `ProjectChecklist.validationId`. Não obrigatório.

## API

| Método | Path | Notas |
|--------|------|-------|
| POST | `/api/projects/:id/validations` | body tipo + campos opcionais; 201 draft |
| GET | `/api/projects/:id/validations` | 404 IDOR no projeto |
| GET | `/api/validations` | filtros `status`, `projectId`, `clientId`, `reviewerUserId`, `dueBefore`, `dueAfter`; tenant B → `[]` |
| GET | `/api/validations/:id` | 404 vazio se IDOR |
| PATCH | `/api/validations/:id` | ignora `status` |
| POST | `/api/validations/:id/transition` | body `{ to, resultNotes? }`; 409 ilegal |

`workspaceId` no body/query é ignorado. Status **não** muda por PATCH.

Events no `ActivityEvent` do projeto: `validation.requested`, `validation.in_review`, `validation.changes_requested`, `validation.approved`, `validation.rejected`. Cancelar não emite event. `changes_requested` **não** altera `Stage.status`.

## Web

`/validacoes` (filtros status/projeto/cliente/responsável/prazo), `/validacoes/:id` (transições). Seção **Validações** em `/projetos/:id`. StatusPill **purple**. Visitante → `/login`.
