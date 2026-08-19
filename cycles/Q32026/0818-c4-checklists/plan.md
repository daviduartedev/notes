# plan.md — Checklists (C4)

> **Ciclo:** `0818-c4-checklists`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C2 fechado (C3 já entregue)

---

## Resumo

Checklist é trabalho **previsto**. Aplicar template gera `ProjectChecklist` + `ChecklistItem` por **cópia profunda**. Mutar o molde não altera instâncias. Completar item **não** muda `Stage.status`. Sem CRUD UI de templates neste cycle (seed + apply).

## Diagnóstico — estado atual (C3)

| Área | Estado |
|------|--------|
| Prisma | Sem modelos de checklist |
| API | Sem apply/list/patch de checklist |
| Seed | Só `saas_delivery` (etapas) |
| Web | Ficha com Etapas + histórico; nav sem Checklists |
| Testes | Vitest HTTP/domínio; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C4-D1 | Quem edita template | Só `owner` cria/edita; `member` aplica e marca itens | brief |
| C4-D2 | UI de templates | Seed + apply; **sem** CRUD UI | brief |
| C4-D3 | Deep copy | Apply copia `name` + itens (`title`, `order`); instância independente | brief |
| C4-D4 | `validationId` | Coluna nullable; **sempre null** neste cycle | brief |
| C4-D5 | Ligação | Obrigatório `projectId`; `stageId` opcional (404 se etapa de outro projeto) | brief |
| C4-D6 | Seed | Template `Deploy Staging SaaS` (`key: deploy_staging_saas`) com 8 itens | brief |
| C4-D7 | Events | `checklist.applied`, `checklist.item_completed` no `ActivityEvent` do projeto | brief |
| C4-D8 | Completar item | `completedByUserId` = sessão; `completedAt`; `note` opcional | brief |
| C4-D9 | Stage.status | Completar item **não** toca etapa (domínio sem Stage) | brief |
| C4-D10 | Desmarcar | `completed: false` limpa `completedAt` e `completedByUserId`; sem event | default |
| C4-D11 | Apply repetido | Cada apply cria **nova** instância (mesmo template em N projetos/vezes) | aceite |
| C4-D12 | Isolamento collection | `GET /api/checklists` no tenant B → lista vazia (não 404) | ORCH-006 |
| C4-D13 | IDOR item | `PATCH /api/checklist-items/:id` outro workspace → 404 vazio | aceite |
| C4-D14 | Member edita template | `PATCH` template → **403** (recurso visível, papel insuficiente) | C4-D1 |
| C4-D15 | `workspaceId` | Só da sessão; body/query ignorados | ouro |
| C4-D16 | Playwright | Proibido; aceite via Vitest API/domínio + guard de rota | ORCH-008 |
| C4-D17 | Template `key` | Campo `key` único por workspace para seed idempotente (padrão C2) | default |

Perguntas do `request.md` (quem edita; UI de templates) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/deploy-staging-template.ts   seed 8 itens
apps/api/src/domain/checklist-instance.ts        deep copy puro
apps/api/src/domain/checklist-item.ts            complete/uncomplete (sem Stage)
apps/api/src/checklists/seed.ts                  ensure por workspace
apps/api/src/checklists/routes.ts                HTTP
apps/api/src/store                               templates + instâncias (memory + prisma)
apps/web/src/app/projetos/[id]                   seção Checklists
apps/web/src/app/checklists                      lista do workspace
```

Contratos:

```text
GET  /api/checklist-templates
PATCH /api/checklist-templates/:id          owner; body { name?, description?, items?: [{ id, title }] }
POST /api/projects/:id/checklists/apply     body { templateId, stageId? }
GET  /api/projects/:id/checklists
GET  /api/checklists
PATCH /api/checklist-items/:id              body { completed: boolean, note? }
```

- Auth: 401 sem sessão; 403 sem membership.
- Apply: template/projeto/etapa fora do workspace → 404 vazio.
- Item completed: event só na transição para concluído.

## Tasks (flat)

1. Domínio: seed 8 itens + deep copy + complete item (sem Stage.status).
2. Prisma + store (memory + prisma) + seed workspace.
3. HTTP apply/list/patch + testes (dois projetos, mutar template, IDOR, member 403, stage intacta).
4. Persistência Postgres (`persist-c4.test.ts`, skip sem `DATABASE_URL`).
5. UI ficha + `/checklists` + nav + middleware.
6. Gates lint/typecheck/test/build.

## Fora de escopo

CRUD UI de templates, checklist como blocker, sync template→instâncias, validações (C5), Playwright.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Cascade Stage vs checklist | `stageId` `onDelete: SetNull`; delete explícito de checklists no `deleteProject` |
| Confundir template e instância | Cópia por valor no domínio; teste muta título do molde |
| Completar item avançar etapa | Função de domínio sem Stage; assert HTTP de `Stage.status` |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
