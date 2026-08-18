# Brief — Cycle 02 Agent (Etapas e transições)

Você é o **Cycle 02 Agent**. Contexto limpo. Não pergunte nada. Não inicie C3+. Não reabra C1 salvo bug bloqueante causado por este cycle.

## Paths

- Workspace: `c:\dev\utopia\internal\notes`
- Cycle: `cycles/Q32026/0818-c2-etapas-e-transicoes/`
- Tipo: Large (4 stages)
- Estado: `docs/execution/CURRENT_STATE.md`, `DECISIONS.md`, `ORCHESTRATOR.md`
- C1 fechado: `cycles/Q32026/0818-c1-clientes-e-projetos/CLOSURE.md`
- Relatório: `docs/execution/reports/c2-report.md`

## Missão

Refine → stages 1–4 com summaries → review → validate (lint/typecheck/test/build, **sem Playwright**) → update-spec → CLOSURE → commit `cycle(02): stages and transitions` → push `origin main` → atualizar `docs/execution/*`.

## Herança (disco)

- Prisma: User, Workspace, Member, Client, Project (envelope status), ActivityEvent
- `lookupForSession` → 404 vazio; `workspaceId` só da sessão
- Domain: `apps/api/src/domain/project-status.ts` (envelope ≠ pipeline)
- Ficha: `apps/web/src/app/projetos/[id]/`
- Criação de projeto em `apps/api/src/projects/` — **você deve passar a copiar etapas em transação**
- Portas 3015/3014, pnpm, Postgres Compose :5433 local

## Decisões fechadas

| Tópico | Decisão |
|---|---|
| D7 seed | Um template **SaaS delivery** por workspace. Outros tipos = C11 |
| Quem transiciona | Qualquer `member`/`owner` do workspace |
| Reabrir `completed` | **Não** neste cycle |
| Grafo (keys, ordem, phase, arestas **lineares**) | ver tabela abaixo |
| `blocked` | Status de etapa setável neste cycle (ação `block`/`unblock` na etapa atual). Entidade Blocker = C7; C2 só o status |
| PATCH `currentStageId` | **Proibido** |
| Playwright | Proibido; Stage 4 = testes HTTP/domínio |

### Grafo seed SaaS delivery

| order | key | phase | allowedNextKeys |
|------:|-----|-------|-----------------|
| 1 | `briefing` | `commercial` | `proposal` |
| 2 | `proposal` | `commercial` | `waiting_client` |
| 3 | `waiting_client` | `commercial` | `kickoff` |
| 4 | `kickoff` | `commercial` | `ux` |
| 5 | `ux` | `design` | `prototype` |
| 6 | `prototype` | `design` | `design_handoff` |
| 7 | `design_handoff` | `design` | `development` |
| 8 | `development` | `development` | `staging` |
| 9 | `staging` | `development` | `production` |
| 10 | `production` | `development` | _(nenhum — terminal)_ |

Labels UI pt-BR (Caveat): Briefing, Proposta, Aguardando cliente, Kickoff, UX, Protótipo, Handoff design, Desenvolvimento, Staging, Produção.

`waiting_client` existe de propósito (C8 consome depois). Não criar motor BPM.

## Regras de domínio (testes unitários obrigatórios — coração do cycle)

- Transição só se a aresta existir **e** o status da etapa origem permitir
- Status de etapa: `pending \| in_progress \| waiting \| blocked \| completed \| skipped`
- Etapa `blocked` **não** completa
- Completar a etapa atual move `Project.currentStageId` para o sucessor em `allowedNextKeys` (se houver)
- Mutar o seed/template **não** reescreve instâncias já copiadas (teste)
- Uma etapa atual por projeto
- Instância ≠ template (deep copy de key/phase/order/allowedNextKeys/critérios texto)

Funções puras em `apps/api/src/domain/` (`canTransition`, motivos em pt-BR para UI disabled).

## Escopo por stage

### Stage 1 — Domínio + testes da matriz

Models conceituais: `WorkflowTemplate`, `StageTemplate`, `Stage` instância; `Project.currentStageId`, `Project.workflowTemplateId`. Testes da matriz (válidas, pulo ilegal, blocked, completed terminal).

### Stage 2 — Persistência + API + backfill

- Ao **criar projeto**: transação copia stages do template SaaS do workspace; primeira etapa `in_progress` = current; demais `pending`
- Backfill projetos C1 existentes
- `POST /api/projects/:id/stages/:stageId/transition` (body Zod: destino e/ou action). Sem PATCH genérico de current
- Events: `stage.started`, `stage.transitioned`, `stage.completed` via ActivityEvent existente
- 404 cross-tenant; 409 transição ilegal **sem** gravar event de transição

### Stage 3 — UI na ficha

`/projetos/:id` seção Etapas (lista/board vertical). Labels manuscritas. Botões disabled se inválido, com motivo. Visual waiting / blocked / overdue (overdue já vem do projeto C1).

### Stage 4 — Testes de isolamento (não Playwright)

- Avançar etapa válida; rejeitar pulo ilegal; histórico de/para no payload
- Template editado depois não muda stages de projeto antigo
- IDOR 404

## Fora de escopo

Editor de workflow, múltiplos templates na UI, checklists/validações reais, `/pipeline` (C3), auto-aprovação, drag-and-drop, C11 tipos extra.

## Aceite

- Projeto novo possui as 10 etapas do template SaaS
- Pulo ilegal → 4xx e **não** grava event de transição
- Histórico mostra de/para (ex. `ux` → `prototype`) no payload
- Alterar template seed não muda stages de projeto antigo

## Commit

`cycle(02): stages and transitions`

Retorno: STATUS, SHA, gates, path `docs/execution/reports/c2-report.md`, ≤10 linhas.
