# Pendências / blockers

Pendência é **circunstancial**. Checklist é previsto. Tabelas distintas (`Blocker` ≠ `ChecklistItem`).

## Máquina

`open → resolved | cancelled`. Create sempre `open`. Status só via `POST /api/blockers/:id/decide` (`resolve` | `cancel`). Terminais sem saída.

## Responsável

- `assigneeKind=internal`: `assigneeUserId` obrigatório e member do workspace
- `assigneeKind=client`: `assigneeUserId` null (body ignorado); copy UI **Aguardando cliente**

## Bloqueio

- `blocksStageId` opcional (etapa do mesmo projeto)
- `blocksProject` boolean
- Ao criar com `blocksStageId` = etapa atual `in_progress`/`waiting`: `Stage.status=blocked`
- `evaluateStageAction` rejeita `complete` se Blocker open `blocksProject` ou `blocksStageId===stageId`, mesmo se a etapa estiver `in_progress`
- Motivo pt-BR: `Há pendência em aberto bloqueando esta etapa`
- Resolve/cancel **não** avançam etapa; se não restar Blocker open a bloquear a etapa atual `blocked`, volta a `in_progress`

## Campos

title, dueDate?, notes?, openedAt (servidor), resolvedAt/cancelledAt, `sourceMeetingId` nullable sem FK.

## API

| Método | Path | Notas |
|--------|------|-------|
| POST | `/api/blockers` | body `projectId`, `title`, `assigneeKind`, …; `workspaceId`/`status` ignorados |
| GET | `/api/blockers` | filtros status, assigneeKind, assigneeUserId, projectId, clientId, blocking, overdue; tenant B → `[]` |
| GET | `/api/projects/:id/blockers` | 404 IDOR |
| GET | `/api/blockers/:id` | 404 IDOR |
| POST | `/api/blockers/:id/decide` | `{ action, notes? }`; 409 ilegal sem event extra |

Events no projeto: `blocker.opened`, `blocker.resolved`. Cancel sem event.

## Web

`/pendencias` (filtros), `/pendencias/:id` (decidir). Seção na ficha do projeto. Pills Pendência / Aguardando cliente no pipeline e no cabeçalho da ficha. Nav inclui Pendências.

## Fora

Checklist → blocker automático, kanban de tickets, portal do cliente, FK de reunião, Playwright.
