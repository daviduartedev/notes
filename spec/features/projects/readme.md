# Projetos

CRUD de `Project`. Relação Cliente **1:N** Projeto. Envelope de status **distinto** das etapas (C2).

## Status

`draft | active | on_hold | completed | cancelled`.

Transições: `draft→active|cancelled`; `active→on_hold|completed|cancelled`; `on_hold→active|cancelled`; `completed` e `cancelled` terminais. Transição inválida → **409**.

Create sempre inicia em `draft`. Prioridade `low | medium | high | urgent`. Progresso inteiro 0–100.

## Overdue

Se `status === active` e `dueDate < now`, o DTO inclui `visualState: "overdue"`. Caso contrário `null`.

## API

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/projects` | filtros `ownerUserId`, `status`, `clientId`, `dueBefore`, `dueAfter`, `priority` |
| POST | `/api/projects` | cliente deve ser do workspace; senão 404 vazio |
| GET | `/api/projects/:id` | 404 vazio se IDOR |
| PATCH | `/api/projects/:id` | |
| DELETE | `/api/projects/:id` | |
| GET | `/api/projects/:id/activity` | |

## Web

`/projetos`, `/projetos/:id` (cabeçalho operacional + seção Etapas C2 + **seção Checklists C4** + **seção Validações C5** + **seção Aprovações C6** + **seção Pendências C7**; sem portal do cliente). Lista também em `/clientes/:id`. Board operacional em `/pipeline` (C3); `completed`/`cancelled` não entram no quadro.
