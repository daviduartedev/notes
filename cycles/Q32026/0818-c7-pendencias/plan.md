# plan.md — Pendências / blockers (C7)

> **Ciclo:** `0818-c7-pendencias`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C2 fechado; C3/C4/C6 no disco

---

## Resumo

Pendência (Blocker) é **circunstancial** e distinta de Checklist. Pode bloquear etapa e/ou projeto. Completar etapa é rejeitado enquanto houver Blocker `open` que bloqueie a etapa atual ou o projeto. Resolver **não** avança etapa; só desbloqueia.

## Diagnóstico — estado atual (C6)

| Área | Estado |
|------|--------|
| Prisma | Sem modelo Blocker; Checklist/Approval/Validation existem |
| API | `GET /api/blockers` 404 de roteador |
| Domínio | `stage-transition.ts` rejeita complete se `Stage.status=blocked`, mas sem invariante de Blocker open |
| Web | Ficha com Etapas + Checklists + Validações + Aprovações; nav sem Pendências |
| Testes | Vitest; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C7-D1 | Entidade | Tabela `Blocker` ≠ `ChecklistItem` / `ProjectChecklist` | brief + request |
| C7-D2 | Status | `open\|resolved\|cancelled`; create sempre `open` | brief |
| C7-D3 | assigneeKind | `internal` (assigneeUserId obrigatório, member do workspace) \| `client` (assigneeUserId null) | brief |
| C7-D4 | Bloqueio | `blocksStageId` opcional; `blocksProject` boolean (default false) | brief |
| C7-D5 | Auto-block | Ao criar Blocker com `blocksStageId` = etapa atual (`in_progress`/`waiting`): `Stage.status=blocked` | brief |
| C7-D6 | Complete | `evaluateStageAction` rejeita `complete` se Blocker open `blocksProject` ou `blocksStageId===stageId`; motivo pt-BR | brief |
| C7-D7 | Resolve | Não chama transition complete; se não restar Blocker open a bloquear a etapa atual e ela estiver `blocked`, volta a `in_progress` | brief + request |
| C7-D8 | Cancel | Mesmo desbloqueio que resolve; sem event de activity | default C6 |
| C7-D9 | Events | `blocker.opened`, `blocker.resolved` no activity do **projeto**; cancel sem event | default C6 |
| C7-D10 | Copy cliente | UI "Aguardando cliente" quando `assigneeKind=client` | brief |
| C7-D11 | sourceMeetingId | Nullable, sem FK (C9 futuro); body aceito e persistido | brief |
| C7-D12 | Isolamento | GET/decide outro tenant → 404 vazio; `GET /api/blockers` → `[]` | ORCH-006 |
| C7-D13 | workspaceId | Só da sessão; body ignorado | ouro |
| C7-D14 | Ilegal | 409 `{ error, reason }` sem gravar event | C2 |
| C7-D15 | Quem muta | Qualquer `member`/`owner` do workspace | default C2 |
| C7-D16 | Playwright | Proibido; aceite via Vitest + guard de rota | ORCH-008 |
| C7-D17 | Filtros lista | `status`, `assigneeKind`, `assigneeUserId`, `projectId`, `clientId`, `blocking`, `overdue` | request |
| C7-D18 | Nested GET | `GET /api/projects/:id/blockers` para a ficha | C5/C6 paralelo |
| C7-D19 | Sem PATCH status | Status só via `POST /api/blockers/:id/decide` `resolve\|cancel` | default C6 |
| C7-D20 | Campos | title, dueDate?, notes?, openedAt (server), resolvedAt/cancelledAt | request |
| C7-D21 | Indicadores | Ficha: pill se houver open; pipeline: pills Pendência / Aguardando cliente | brief |
| C7-D22 | Checklist | Completar item de checklist **não** cria Blocker | C4 + request fora |

Perguntas do `request.md` (auto-set blocked; assigneeKind) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/blocker-status.ts      máquina + hints para complete
apps/api/src/domain/stage-transition.ts    invariante complete + openBlockers
apps/api/src/blockers/schema.ts            Zod
apps/api/src/blockers/dto.ts               serialize
apps/api/src/blockers/routes.ts            HTTP
apps/api/src/store                         memory + prisma
apps/web/src/app/pendencias                lista + ficha
apps/web/src/components/project-blockers   seção na ficha do projeto
```

Contratos:

```text
POST /api/blockers                         body { projectId, title, assigneeKind, assigneeUserId?, blocksStageId?, blocksProject?, dueDate?, notes?, sourceMeetingId? }
GET  /api/blockers                         filtros; tenant B → []
GET  /api/blockers/:id                     404 IDOR
GET  /api/projects/:id/blockers            404 IDOR no projeto
POST /api/blockers/:id/decide              body { action: resolve|cancel, notes? }; 409 ilegal
```

- Auth: 401 sem sessão; 403 sem membership.
- Create/get/decide fora do workspace → 404 vazio.
- Collection outro tenant → `[]`.
- `workspaceId` / `status` / `openedAt` no body são ignorados.
- `assigneeUserId` no body com `assigneeKind=client` é ignorado (grava null).

## Tasks (flat)

1. Domínio: máquina Blocker; invariante complete com openBlockers; resolve não avança etapa.
2. Prisma Blocker + store (memory + prisma) + auto-block da etapa atual.
3. HTTP create/list/get/decide + testes (complete 409, resolve desbloqueia sem avançar, IDOR, collection, ≠ checklist).
4. Persistência Postgres (`persist-c7.test.ts`, skip sem `DATABASE_URL`).
5. UI ficha + `/pendencias` + `/pendencias/:id` + nav + middleware + pills no pipeline.
6. Gates lint/typecheck/test/build.

## Fora de escopo

Converter checklist incompleto em blocker; kanban genérico; portal do cliente; CRUD de reuniões (C9); Playwright; C8+.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Confundir Blocker com Checklist | Tabelas distintas; teste HTTP de checklist intacto |
| Complete passar com Stage.status != blocked | Invariante em `evaluateStageAction` independente do status |
| Resolve avançar etapa | Decide não chama `complete`; assert currentStageKey |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
