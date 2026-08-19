# plan.md — Pipeline (C3)

> **Ciclo:** `0818-c3-pipeline`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C2 fechado

---

## Resumo

`/pipeline` é o quadro operacional: cada projeto ativo aparece **somente** na coluna da `currentStage.key`. Read-mostly, click-only. Sem drag-and-drop, sem editar template, sem `/hoje`.

## Diagnóstico — estado atual (C2)

| Área | Estado |
|------|--------|
| Prisma | `Project.currentStageId` + `currentStage` relation; 10 etapas copiadas |
| DTO | `currentStageKey` no GET da ficha (com `stages`); lista de projetos **sem** stages |
| API | `POST .../stages/:stageId/transition`; sem `GET /api/pipeline` |
| Web | Nav Hoje / Clientes / Projetos; ficha com board **vertical**; middleware sem `/pipeline` |
| Testes | Vitest HTTP/domínio; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C3-D1 | Colunas | Por **`currentStage.key`** (10 keys SaaS), ordem `Stage.order` do template seed | brief |
| C3-D2 | Drag-and-drop | **Não**. Click no card → `/projetos/:id`. Sem `@dnd-kit` | brief (Medium) |
| C3-D3 | Filtros | Query `ownerUserId`, `clientId`, `priority` (Zod; inválido → 400) | brief |
| C3-D4 | Envelope no board | `draft \| active \| on_hold`. Excluir `completed \| cancelled` | brief default |
| C3-D5 | Sem etapa | `currentStageId`/`key` null → omitir o card | brief |
| C3-D6 | Key desconhecida | Card cujo `currentStage.key` não está nas 10 colunas SaaS → omitir (não inventar coluna) | default |
| C3-D7 | Colunas vazias | Sempre devolver as **10 colunas** (mesmo sem cards) | board estável |
| C3-D8 | Isolamento | GET collection: workspace B vê **lista/colunas vazias**, nunca cards de A. 404 só em recurso por id | brief + ORCH-006 |
| C3-D9 | Card | id, name, clientId, clientName, ownerUserId, ownerName, dueDate, priority, status, currentStageKey, currentStageLabel, stageStatus, visualState | brief |
| C3-D10 | Pills UI | overdue (projeto); blocked / waiting da **etapa atual** | brief |
| C3-D11 | ownerName | `User.name` se houver, senão e-mail | default |
| C3-D12 | Ordem nos cards | `dueDate` asc (null por último), depois `name` pt-BR | default |
| C3-D13 | Joins | Uma query Prisma com `client` + `currentStage` + `owner` (sem N+1 por card) | brief |
| C3-D14 | Playwright | Proibido; aceite via Vitest API/domínio + guard de rota | ORCH-008 |
| C3-D15 | `workspaceId` | Só da sessão; query/body ignorados | ouro |

Perguntas do `request.md` (key vs phase; drag neste Medium) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/pipeline-board.ts   agrupa cards nas 10 colunas (puro)
apps/api/src/pipeline/routes.ts         GET /api/pipeline
apps/api/src/store                      listPipelineCards (memory + prisma, joins)
apps/web/src/app/pipeline/page.tsx      board horizontal + filtros GET
```

Contrato:

```text
GET /api/pipeline?ownerUserId=&clientId=&priority=
→ { columns: [{ key, label, order, projects: PipelineCard[] }] }
```

- Auth: 401 sem sessão; 403 sem membership.
- Sem events de activity (read-only).
- Sem PATCH/POST no board.

## Tasks (flat)

1. Domínio `buildPipelineBoard` + testes.
2. Store `listPipelineCards` (memory + prisma).
3. `GET /api/pipeline` + testes HTTP (agrupamento, filtros, isolamento, omitir completed/sem etapa).
4. Persistência Postgres (skip se sem `DATABASE_URL`).
5. UI `/pipeline`, nav, middleware, filtros.
6. Gates lint/typecheck/test/build.

## Fora de escopo

Editar template, `/hoje`, drag-and-drop, coluna inválida, transicionar pelo board, C4+.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| N+1 client/owner/stage | `include` Prisma numa `findMany` |
| AppShell `max-w-5xl` esconde colunas | `/pipeline` usa largura plena + `overflow-x-auto` |
| Lista de projetos C1 sem stages | board usa endpoint próprio, não `GET /api/projects` |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
