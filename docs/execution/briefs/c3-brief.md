# Brief — Cycle 03 Agent (Pipeline)

Você é o **Cycle 03 Agent**. Contexto limpo. Não pergunte nada. Não inicie C4+. Não reabra C2 salvo bug bloqueante.

## Paths

- Workspace: `c:\dev\utopia\internal\notes`
- Cycle: `cycles/Q32026/0818-c3-pipeline/`
- Tipo: Medium (flat tasks)
- Estado: `docs/execution/CURRENT_STATE.md`, `DECISIONS.md`, `ORCHESTRATOR.md`
- C2 fechado: `cycles/Q32026/0818-c2-etapas-e-transicoes/CLOSURE.md`
- Relatório: `docs/execution/reports/c3-report.md`

## Missão

Refine → execute flat → review → validate (lint/typecheck/test/build, **sem Playwright**) → update-spec → CLOSURE → commit `cycle(03): pipeline board` → push `origin main` → atualizar `docs/execution/*`.

## Herança

- `Project.currentStageKey`, `currentStageId`, stages com `status` (`waiting`, `blocked`, etc.)
- `POST /api/projects/:id/stages/:stageId/transition` (C2)
- `serializeProject` / `projectVisualState` (overdue)
- `AppShell` nav em `apps/web/src/components/app-shell.tsx` — adicionar **Pipeline**
- Middleware: estender matcher para `/pipeline`
- `lookupForSession`, 404 cross-tenant, `workspaceId` só da sessão
- Portas 3015/3014, pnpm

## Decisões fechadas

| Tópico | Decisão |
|---|---|
| Colunas | Por **`currentStage.key`** (10 colunas do template SaaS), ordem `Stage.order` |
| Drag-and-drop | **Não** neste Medium — click-only nos cards → `/projetos/:id`. Sem @dnd-kit |
| Filtros | `ownerUserId`, `clientId`, `priority` (query na API) |
| Card | cliente, projeto, responsável (nome), prazo, pills: overdue / blocked / waiting na etapa atual |
| API | `GET /api/pipeline` → `{ columns: [{ key, label, order, projects: [...] }] }` scoped ao workspace |
| Projetos sem etapa | não devem aparecer (C2 garante etapas; se null, omitir) |
| Playwright | Proibido |

## Escopo

- Endpoint `GET /api/pipeline` com joins eficientes (evitar N+1): projetos ativos relevantes (`draft|active|on_hold` — excluir `completed|cancelled` do board, salvo se o refine decidir incluir on_hold; **default: incluir draft, active, on_hold**)
- Cada card: id, name, clientId, clientName, ownerUserId, ownerName, dueDate, priority, project status, currentStageKey, currentStageLabel, stageStatus, visualState (overdue do projeto)
- UI `/pipeline`: board horizontal scroll, colunas com título Caveat, cards clicáveis
- Filtros na UI (selects) refetch com query params
- Testes: API agrupa corretamente; dois projetos em keys diferentes só na coluna certa; workspace B não vê cards (404 ou lista vazia — **lista vazia para GET collection é ok; nunca vazar dados de B**)
- Nav + middleware `/pipeline`

## Fora de escopo

Editar template, `/hoje`, drag-and-drop, coluna inválida, C4+

## Aceite

- Dois projetos em etapas diferentes → cada um só na coluna da `currentStage.key`
- Membro workspace B não vê cards do A
- (Drag n/a — click-only)

## Commit

`cycle(03): pipeline board`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
