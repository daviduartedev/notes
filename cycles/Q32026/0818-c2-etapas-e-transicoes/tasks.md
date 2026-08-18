# tasks.md — Etapas e transições (C2)

> Large: 4 stages. Checkpoints humanos suspensos (ORCH-001); `stage-summaries/` obrigatórios.  
> Marcar `[x]` só com evidência (comando rodado).

## Stage 1 — Domínio + testes da matriz

- [x] Tipos: `WorkflowTemplate`, `StageTemplate`, `Stage` instância; `currentStageId` / `workflowTemplateId` no projeto (conceitual)
- [x] Grafo seed SaaS delivery (10 keys, fases, arestas lineares, labels pt-BR)
- [x] Funções puras: `copyStagesFromTemplate`, `canTransition` / `evaluateStageAction` / `applyStageAction` (motivos pt-BR)
- [x] Testes: transições válidas da matriz; pulo ilegal; `blocked` não completa; `completed` terminal; uma etapa atual; mutar template não altera cópia
- [x] Gate Stage 1: testes de domínio verdes

## Stage 2 — Persistência + API + backfill

- [x] Prisma: `WorkflowTemplate`, `StageTemplate`, `Stage` + enums; `Project.currentStageId`, `Project.workflowTemplateId`; migration
- [x] Seed: um template SaaS por workspace
- [x] `createProject` em transação copia etapas (primeira `in_progress` = current; demais `pending`) + `stage.started`
- [x] Backfill projetos C1 sem etapas
- [x] `POST /api/projects/:id/stages/:stageId/transition` (Zod `action` e/ou `to`); PATCH `currentStageId` ignorado
- [x] Events `stage.started`, `stage.transitioned`, `stage.completed`; 409 sem gravar transição
- [x] 404 cross-tenant / stage de outro projeto; `workspaceId` só da sessão
- [x] GET ficha inclui `stages` + `actions` (enabled/reason)
- [x] Gate Stage 2: lint/typecheck/test/build

## Stage 3 — UI na ficha

- [x] `/projetos/:id` seção Etapas (lista/board vertical)
- [x] Labels Caveat (manuscritas) conforme tabela do plan
- [x] Botões disabled se inválido, com motivo
- [x] Visual waiting / blocked; overdue já do C1 no cabeçalho
- [x] Gate Stage 3: lint/typecheck/test/build

## Stage 4 — Isolamento (API/domínio, sem Playwright)

- [x] HTTP: avançar etapa válida; payload de/para (ex. `ux` → `prototype`)
- [x] HTTP: pulo ilegal → 409 e **não** grava event de transição
- [x] Template editado depois não muda stages de projeto antigo
- [x] IDOR 404 na transição
- [x] Persistência Postgres (quando `DATABASE_URL`) cobre os mesmos casos
- [x] Gate Stage 4: lint/typecheck/test/build

## Fechamento do cycle

- [x] `review.md` (cycle completo)
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec (somente o entregue)
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c2-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(02): stages and transitions` + push `origin main`
