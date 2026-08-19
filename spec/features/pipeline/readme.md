# spec/features/pipeline/readme.md

Quadro operacional agrupado por **`currentStage.key`**. Click-only: o card abre `/projetos/:id`. Sem drag-and-drop neste cycle.

## Colunas

Sempre as **10 keys** do template SaaS delivery, na ordem `order` do seed. Coluna vazia continua visível. Card cujo `currentStage.key` não está nessas keys é omitido. Projeto sem etapa atual (`currentStageId` nulo) é omitido.

## Envelope no board

Só `draft | active | on_hold`. `completed` e `cancelled` não aparecem.

## Card

id, name, clientId, clientName, ownerUserId, ownerName, dueDate, priority, status do projeto, currentStageKey, currentStageLabel, stageStatus da etapa atual, visualState (overdue do C1).

Pills na UI: Atrasado / Bloqueada / Aguardando.

## API

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/pipeline` | `{ columns: [{ key, label, order, projects }] }`; filtros `ownerUserId`, `clientId`, `priority`; 401/403; query `workspaceId` ignorada |

Collection de outro tenant: **colunas vazias** (não vaza cards). 404 vazio continua só em recurso por id.

Joins: uma `findMany` Prisma com `client`, `currentStage` e `owner`.

## Web

`/pipeline`: board horizontal com scroll, títulos Caveat, filtros GET (responsável, cliente, prioridade). Nav inclui Pipeline. Middleware protege a rota.
