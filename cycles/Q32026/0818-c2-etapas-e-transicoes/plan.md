# plan.md — Etapas e transições (C2)

> **Ciclo:** `0818-c2-etapas-e-transicoes`  
> **Tipo:** Large (4 stages)  
> **Data:** 18/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C1 fechado

---

## Resumo

Todo projeto nasce com 10 etapas copiadas do template **SaaS delivery** do workspace. Transição só por aresta do grafo **e** status da etapa origem. Sem motor BPM. Envelope `Project.status` (C1) permanece distinto do pipeline de etapas.

## Diagnóstico — estado atual (C1)

| Área | Estado |
|------|--------|
| Prisma | User, Workspace, Member, Client, Project (envelope), ActivityEvent |
| Domínio | `project-status.ts` = envelope; sem Stage |
| API | CRUD `/api/projects`; `lookupForSession` → 404 vazio |
| Criação | `createProject` sem transação de cópia de etapas |
| Web | `/projetos/[id]` cabeçalho + histórico; sem seção Etapas |
| Testes | Vitest HTTP/domínio; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C2-D1 | Seed | Um template `saas_delivery` por workspace; outros tipos = C11 | D7 / brief |
| C2-D2 | Quem transiciona | Qualquer `member`/`owner` do workspace | brief |
| C2-D3 | Reabrir `completed` | Não neste cycle | brief |
| C2-D4 | Grafo | Linear, 10 keys (tabela abaixo); `waiting_client` de propósito (C8) | brief |
| C2-D5 | `blocked` | Status de etapa; ações `block`/`unblock` na etapa atual. Entidade Blocker = C7 | brief |
| C2-D6 | PATCH `currentStageId` | Proibido (ignorado como mass assignment) | brief |
| C2-D7 | Playwright | Proibido; Stage 4 = HTTP/domínio | ORCH-008 |
| C2-D8 | Transição ilegal | HTTP **409** `{ error: "Transição inválida", reason }` **sem** event de transição | brief + C1 |
| C2-D9 | Events | `stage.started`, `stage.transitioned`, `stage.completed` no `ActivityEvent` do projeto | request |
| C2-D10 | Body transição | Zod: `action` e/ou `to` (key destino). Sem `to` + um sucessor → completa para ele | brief |
| C2-D11 | Ações | `complete` \| `block` \| `unblock` \| `wait` | brief + status `waiting` |
| C2-D12 | Instância | Deep copy de key/phase/order/allowedNextKeys/label/critérios texto | brief |
| C2-D13 | Completar | Origem `in_progress` ou `waiting`; `blocked` não completa; ponteiro vai ao sucessor se houver | brief |
| C2-D14 | Terminal | `production` sem sucessor: complete marca a etapa `completed`; `currentStageId` permanece nela | default |
| C2-D15 | Cross-tenant / stage órfã | 404 vazio (ORCH-006) | brief |

Perguntas do `request.md` estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Grafo seed SaaS delivery

| order | key | phase | allowedNextKeys | Label UI |
|------:|-----|-------|-----------------|----------|
| 1 | `briefing` | `commercial` | `proposal` | Briefing |
| 2 | `proposal` | `commercial` | `waiting_client` | Proposta |
| 3 | `waiting_client` | `commercial` | `kickoff` | Aguardando cliente |
| 4 | `kickoff` | `commercial` | `ux` | Kickoff |
| 5 | `ux` | `design` | `prototype` | UX |
| 6 | `prototype` | `design` | `design_handoff` | Protótipo |
| 7 | `design_handoff` | `design` | `development` | Handoff design |
| 8 | `development` | `development` | `staging` | Desenvolvimento |
| 9 | `staging` | `development` | `production` | Staging |
| 10 | `production` | `development` | _(nenhum)_ | Produção |

Status de etapa: `pending \| in_progress \| waiting \| blocked \| completed \| skipped`.

## Arquitetura alvo

```text
apps/api/src/domain/     canTransition / applyStageAction / copy (sem DB)
apps/api/src/store/      memory + prisma (createProject em transação copia etapas)
apps/api/src/projects/   POST .../stages/:stageId/transition; GET ficha com stages
apps/web                 /projetos/:id seção Etapas (board vertical, Caveat)
```

- `workspaceId` só da sessão.
- Sem PATCH genérico de `currentStageId`.
- Sem BPM: arestas explícitas em `allowedNextKeys` copiadas na instância.

## Stages

1. **Domínio + matriz** — tipos, grafo seed, `canTransition`/`applyStageAction`, testes unitários (válidas, pulo ilegal, blocked, terminal, instância≠template).
2. **Persistência + API + backfill** — Prisma, seed, transação na criação, backfill C1, POST transition, events, 404/409.
3. **UI ficha** — seção Etapas; botões disabled com motivo; waiting/blocked/overdue.
4. **Isolamento HTTP** — avanço válido; pulo ilegal sem event; de/para no payload; template editado não muda instância; IDOR 404.

## Fora de escopo

Editor de workflow, múltiplos templates na UI, checklists/validações reais, `/pipeline` (C3), auto-aprovação, drag-and-drop, tipos extras (C11), entidade Blocker (C7), reabrir completed.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| FK circular Project.currentStageId ↔ Stage | `currentStageId` ON DELETE SET NULL; criar etapas e depois apontar |
| Projetos C1 sem etapas | Backfill no seed + hydrate no GET da ficha |
| Testes C1 quebram no delete | Cleanup nula `currentStageId` / cascade |
| UI duplicar regra | API devolve `actions[]` com `enabled` + `reason` |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
