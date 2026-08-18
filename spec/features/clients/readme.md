# Clientes

CRUD de `Client` no workspace da sessão. Um cliente tem **N** projetos (C1).

## Status

`lead | active | inactive | archived` (UI: Lead, Ativo, Inativo, Arquivado).

Transições: `lead→active|archived`; `active→inactive|archived`; `inactive→active|archived`; `archived` terminal. Transição inválida → **409**.

Create sempre inicia em `lead`.

## Campos

nome, empresa, WhatsApp (string), e-mail, responsável interno (`ownerUserId` membro do workspace), observações, status, último contato, próximo follow-up, createdAt.

`workspaceId` e `createdAt` não vêm do body.

## API

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/clients` | filtros `name`, `ownerUserId`, `status` |
| POST | `/api/clients` | 201 |
| GET | `/api/clients/:id` | 404 vazio se IDOR |
| PATCH | `/api/clients/:id` | |
| DELETE | `/api/clients/:id` | 409 se houver projetos |
| GET | `/api/clients/:id/activity` | histórico do cliente + projetos |

## Web

`/clientes`, `/clientes/:id`. Filtros: nome, responsável, status. Ficha lista projetos do cliente.
