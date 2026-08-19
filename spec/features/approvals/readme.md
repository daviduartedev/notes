# Aprovações

Aprovação **autoriza formalmente** o avanço. Não é Validation. `Validation.status === approved` **não** cria Approval (D8). Grant **não** avança etapa.

## Status

`pending | granted | rejected | cancelled | revoked`.

Transições: `pending→granted|rejected|cancelled`; `granted→revoked`. `rejected`, `cancelled` e `revoked` são terminais. Decisão inválida → **409** sem event. Revoke **não** apaga o registro granted (mesmo `id`; `decidedAt` e snapshot permanecem).

Create sempre inicia em `pending`. `approverId` fica null até o decide; no decide vem da **sessão** (body ignorado). Kinds: `proposal | scope | prototype | staging | production | final_acceptance`.

## Snapshot

Gerado no servidor no create, imutável: `currentStageKey`, `projectStatus`, `validationId`, `projectId`, `clientId`. `validationId` opcional (mesmo projeto).

## API

| Método | Path | Notas |
|--------|------|-------|
| POST | `/api/approvals` | body `projectId` + `kind`; 201 pending; snapshot server-side |
| GET | `/api/approvals` | filtros `status`, `kind`, `projectId`, `clientId`, `approverId`; tenant B → `[]` |
| GET | `/api/projects/:id/approvals` | 404 IDOR no projeto |
| GET | `/api/approvals/:id` | 404 vazio se IDOR |
| POST | `/api/approvals/:id/decide` | body `{ action, comment? }`; actions `grant\|reject\|cancel\|revoke`; 409 ilegal |

`workspaceId` no body/query é ignorado. Status **não** muda por PATCH.

Events no `ActivityEvent` do projeto: `approval.granted`, `approval.rejected`, `approval.revoked`. Cancelar não emite event.

## Web

`/aprovacoes` (filtros), `/aprovacoes/:id` (decidir). Seção **Aprovações** em `/projetos/:id`. StatusPill: pending/revoked yellow, granted green, rejected red, cancelled purple. Visitante → `/login`.
