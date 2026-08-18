# Brief — Cycle 01 Agent (Clientes e Projetos)

Você é o **Cycle 01 Agent**. Contexto limpo. Não pergunte nada. Não espere aprovação. Não inicie C2. Não reabra C0 salvo bug bloqueante causado por este cycle.

## Paths

- Workspace: `c:\dev\utopia\internal\notes`
- Cycle: `cycles/Q32026/0818-c1-clientes-e-projetos/`
- Tipo: Large (4 stages)
- Estado: `docs/execution/CURRENT_STATE.md`, `DECISIONS.md`, `ORCHESTRATOR.md`
- C0 fechado: `cycles/Q32026/0818-c0-foundation/CLOSURE.md`
- Relatório: `docs/execution/reports/c1-report.md`

## Missão

Refine → Execute stages 1–4 (com `stage-summaries`) → review → validate (lint/typecheck/test/build, **sem Playwright**) → update-spec → CLOSURE.md → commit `cycle(01): clients and projects` → push `origin main` → atualizar `docs/execution/*`.

Checkpoints humanos suspensos (ORCH-001).

## Ler nesta ordem

1. `AGENTS.md`, `docs/execution/ORCHESTRATOR.md`, `CURRENT_STATE.md`, `DECISIONS.md`
2. `cycles/Q32026/0818-c1-clientes-e-projetos/request.md`
3. `spec/` (security, backend, frontend, database, testing, decisions)
4. Código real: `apps/api` (Hono, Prisma, `lookupForSession`, `workspaceIdFromSession`), `apps/web` (middleware, primitivos UI)
5. `C:\Users\weban\.cursor\commands\` para o fluxo SDD

## Código que você herda (não reinventar)

- API Hono em `apps/api/src/app.ts` — **CORS hoje só GET/POST/OPTIONS; você DEVE incluir PATCH/PUT/DELETE**
- Tenant: `workspaceIdFromSession` + `lookupForSession` → 404 body vazio (ORCH-006)
- Sem membership → 403
- Cookie JWT + `sessionVersion`
- Middleware matcher hoje só `/hoje` e `/login` — **estender para `/clientes` e `/projetos`**
- Web :3015, API :3014
- Prisma em `apps/api/prisma/schema.prisma` — User, Workspace, Member

## Decisões já fechadas (não reabrir)

| Tópico | Decisão |
|---|---|
| Client.status | `lead \| active \| inactive \| archived` (UI: lead, ativo, inativo, arquivado) |
| Transições client.status | `lead→active\|archived`; `active→inactive\|archived`; `inactive→active\|archived`; `archived` terminal |
| Project.status envelope | `draft\|active\|on_hold\|completed\|cancelled` (já no request) |
| Transições Project.status | `draft→active\|cancelled`; `active→on_hold\|completed\|cancelled`; `on_hold→active\|cancelled`; `completed` e `cancelled` terminais |
| Cross-tenant | 404 vazio |
| Progresso | campo manual `progress` inteiro 0–100 neste cycle |
| WhatsApp | string de contato, sem integração |
| Prioridade projeto | `low \| medium \| high \| urgent` |
| Activity | `ActivityEvent`; actions exatamente as do request |
| E2E Playwright | **proibido**; Stage 4 = testes HTTP/API + domínio |
| `/hoje` | continua empty state (C10 preenche) |

## Escopo (do request)

### Stage 1 — Clientes

CRUD: nome, empresa, WhatsApp, e-mail, responsável interno (`ownerUserId` do workspace), observações, status, último contato, próximo follow-up, createdAt.

Rotas web: `/clientes`, `/clientes/:id`. Filtros: nome, responsável, status.

API REST sob `/api/clients` (plural inglês nas rotas; UI pt-BR). `workspaceId` só da sessão. Mass assignment: body não define `workspaceId`/`createdAt`; status só via schema/transição.

### Stage 2 — Projetos

CRUD: workspace(sessão), cliente, nome, descrição, responsável, status envelope, data início, prazo, prioridade, progresso, observações.

`/projetos`, `/projetos/:id` (cabeçalho operacional; sem abas checklist/validação). `/clientes/:id` lista projetos do cliente. Filtros: responsável, status, cliente, prazo, prioridade.

Transições de `Project.status` no `domain/` — não string livre. Prazo vencido + `active` → visual `overdue`.

### Stage 3 — Activity log

`ActivityEvent`: workspaceId, actorId, entityType, entityId, action (enum), payload JSON, createdAt.

Events: `client.created`, `client.updated`, `project.created`, `project.updated`, `project.status_changed`.

GET activity na ficha do cliente e do projeto. Payload consultável **sem** telefone/e-mail extra nos logs de aplicação.

### Stage 4 — Isolamento (em vez de E2E browser)

Testes automatizados (Vitest HTTP + persistência):

- Login → criar cliente → dois projetos no mesmo cliente → histórico com `project.created` duas vezes
- Membro workspace B não lê IDs de A → 404 sem payload
- Transição inválida de `Project.status` rejeitada
- Overdue visual/DTO para `active` com prazo passado

## Fora de escopo

Etapas, pipeline, checklists, validações, aprovações, pendências, lembretes, reuniões, `/hoje` preenchido, busca avançada, UI 1:1 cliente/projeto, Playwright.

## Aceite

- Dois projetos no mesmo cliente em `/clientes/:id` e `/projetos`
- Histórico `project.created` ×2 com payload
- GET projeto de B por membro de A → 404 sem payload
- `Project.status` rejeita transição inválida
- `active` + prazo vencido tem estado visual `overdue`

## Implementação

- Seguir pastas existentes (`apps/api/src/<module>/`, `apps/web/src/app/...`)
- Domain puro em `apps/api/src/domain/` (transições testáveis sem DB)
- Zod na fronteira; TypeScript strict; sem `any`
- Shell mínimo: nav Hoje / Clientes / Projetos (não inventar dashboard)
- Linguagem visual C0 (escuro, Caveat nos títulos)
- Seed: não precisa de clientes no seed de prod; testes criam fixtures (e um segundo workspace para IDOR)
- Não implementar C2 (sem Stage/WorkflowTemplate)

## Commit

`cycle(01): clients and projects`

Não commitar `.env`. Push `origin main`.

## Relatório

`docs/execution/reports/c1-report.md`: STATUS, stages, gates+exit, SHA, push, decisões, deferred.

Retorno ao orchestrator: STATUS, SHA, gates, path do report, ≤10 linhas.
