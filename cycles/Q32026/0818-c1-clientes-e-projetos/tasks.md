# tasks.md — Clientes e Projetos (C1)

> Large: 4 stages. Checkpoints humanos suspensos (ORCH-001); `stage-summaries/` obrigatórios.  
> Marcar `[x]` só com evidência (comando rodado).

## Stage 1 — Clientes

- [x] Prisma: `Client` + enum `ClientStatus`; migration
- [x] Domínio puro: transições de `Client.status` (testes sem DB)
- [x] CORS: incluir PATCH, PUT, DELETE
- [x] `GET /api/workspace/members` (antes de `/:id`)
- [x] REST `/api/clients`: list (filtros nome, responsável, status), GET :id, POST, PATCH, DELETE
- [x] `workspaceId` só da sessão; body não define `workspaceId`/`createdAt`; create status só `lead`
- [x] Transição inválida de client → 409; cross-tenant → 404 vazio
- [x] `ownerUserId` deve ser membro do workspace
- [x] Web: middleware `/clientes`; nav Hoje / Clientes / Projetos; `/clientes` e `/clientes/:id`
- [x] Gate Stage 1: lint/typecheck/test/build (testes de client + domínio)

## Stage 2 — Projetos

- [x] Prisma: `Project` + enums `ProjectStatus`, `ProjectPriority`; migration
- [x] Domínio puro: transições de `Project.status`; `visualState` overdue
- [x] REST `/api/projects`: list (responsável, status, cliente, prazo, prioridade), GET :id, POST, PATCH, DELETE
- [x] Create status só `draft`; progresso 0–100; cliente deve ser do workspace da sessão
- [x] DTO inclui `visualState: "overdue" | null` para `active` + prazo passado
- [x] Web: middleware `/projetos`; `/projetos` e `/projetos/:id` (cabeçalho operacional); lista de projetos em `/clientes/:id`
- [x] Gate Stage 2: lint/typecheck/test/build

## Stage 3 — Activity log

- [x] Prisma: `ActivityEvent` (workspaceId, actorId, entityType, entityId, action, payload JSON, createdAt)
- [x] Actions exatamente: `client.created`, `client.updated`, `project.created`, `project.updated`, `project.status_changed`
- [x] Emissão nas mutações; payload sem telefone/e-mail
- [x] `GET /api/clients/:id/activity` e `GET /api/projects/:id/activity` (404 vazio se IDOR)
- [x] UI: histórico na ficha do cliente e do projeto
- [x] Gate Stage 3: lint/typecheck/test/build

## Stage 4 — Isolamento (API/domínio, sem Playwright)

- [x] HTTP: login → criar cliente → dois projetos → `project.created` ×2 com payload
- [x] HTTP: membro do workspace B não lê IDs de A → 404 sem payload
- [x] Transição inválida de `Project.status` rejeitada (domínio + HTTP 409)
- [x] Overdue no DTO para `active` com prazo passado
- [x] Persistência Postgres (quando `DATABASE_URL`): IDOR + dois projetos + activity
- [x] Gate Stage 4: lint/typecheck/test/build

## Fechamento do cycle

- [x] `review.md` (cycle completo)
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec (somente o entregue)
- [x] `CLOSURE.md`
- [x] Relatório `docs/execution/reports/c1-report.md`
- [x] Atualizar `CURRENT_STATE.md` e `CYCLE_HISTORY.md`
- [x] Commit `cycle(01): clients and projects` + push `origin main`
