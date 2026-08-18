# Stage 2 — Persistência + API + backfill

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 2 / 4
- **Próxima stage pode começar:** sim

## Entrega

Prisma `WorkflowTemplate` / `StageTemplate` / `Stage`; FKs `Project.workflowTemplateId` e `currentStageId`. Seed SaaS por workspace. `createProject` em transação copia as 10 etapas (primeira `in_progress`). Backfill no seed e hydrate no GET da ficha. `POST /api/projects/:id/stages/:stageId/transition`. PATCH `currentStageId` ignorado. Events `stage.started` / `stage.transitioned` / `stage.completed`. 409 sem gravar transição; 404 cross-tenant.

## Evidências

| Comando | Exit |
|---------|------|
| `pnpm db:migrate` | 0 (`20260818250000_stages`) |
| `pnpm db:seed` | 0 |
| testes HTTP `stages.routes.test.ts` | 0 (8 testes) |

## Desvios

Nenhum.

## Blockers

Nenhum.

## Escopo

Sem UI da ficha (Stage 3).
