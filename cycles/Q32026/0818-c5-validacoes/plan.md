# plan.md — Validações (C5)

> **Ciclo:** `0818-c5-validacoes`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C2 fechado; C4 fechado (liga `checklistId` opcional)

---

## Resumo

Validação **verifica** algo antes de avançar. Não é Approval (C6). `changes_requested` não recua etapa e não cria entidade de aprovação. Status só muda via `POST /api/validations/:id/transition`. UI em roxo. Overdue visual quando o prazo venceu e o status não é terminal.

## Diagnóstico — estado atual (C4)

| Área | Estado |
|------|--------|
| Prisma | Sem modelo Validation; `ProjectChecklist.validationId` nullable sempre null |
| API | Sem rotas de validação |
| Domínio | Máquinas de Project.status e Stage; overdue só de projeto |
| Web | Ficha com Etapas + Checklists; nav sem Validações |
| Testes | Vitest HTTP/domínio; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C5-D1 | Estados | `draft→requested\|cancelled`; `requested→in_review\|cancelled`; `in_review→changes_requested\|approved\|rejected`; `changes_requested→in_review\|cancelled` | brief |
| C5-D2 | Transição | Só `POST /api/validations/:id/transition` body `{ to }`; PATCH ignora `status` | brief |
| C5-D3 | Tipos | `prototype`, `staging`, `production`, `feature`, `delivery` | brief |
| C5-D4 | UI cor | StatusPill **purple** para status de validação; overdue continua red | brief |
| C5-D5 | `changes_requested` | Não toca `Stage.status`; não cria Approval | aceite |
| C5-D6 | Overdue | prazo `< now` e status não terminal → `visualState: overdue` | brief |
| C5-D7 | Terminais | `approved`, `rejected`, `cancelled` | default da máquina |
| C5-D8 | Create | Sempre `draft`; `requesterUserId` da sessão | brief |
| C5-D9 | `requestedAt` | Gravado na transição para `requested` | default |
| C5-D10 | Events | `validation.requested`, `.in_review`, `.changes_requested`, `.approved`, `.rejected` no activity do **projeto**; cancelar sem event | brief |
| C5-D11 | Checklist | `checklistId` opcional na Validation; preenche `ProjectChecklist.validationId`; 404 se checklist de outro projeto | brief + C4 |
| C5-D12 | Itens/obs | `notes` texto; `items` JSON `string[]`; `resultNotes` no PATCH/transition | request |
| C5-D13 | Isolamento | GET por id outro tenant → 404 vazio; `GET /api/validations` → `[]` | ORCH-006 |
| C5-D14 | Filtros | `status`, `projectId`, `clientId`, `reviewerUserId`, `dueBefore`/`dueAfter` | request |
| C5-D15 | Quem transiciona | Qualquer `member`/`owner` do workspace (padrão C2) | default |
| C5-D16 | Ilegal | 409 `{ error, reason }` sem gravar event | C2 |
| C5-D17 | PATCH | Campos de conteúdo quando não terminal; `status`/`workspaceId`/`requesterUserId` ignorados | default |
| C5-D18 | Playwright | Proibido; aceite via Vitest + guard de rota | ORCH-008 |
| C5-D19 | `workspaceId` | Só da sessão | ouro |
| C5-D20 | Approval | Sem modelo, rota ou event `approval.*` | fora de escopo |

Perguntas do `request.md` (tipos; ligar checklist) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/validation-status.ts     máquina + events
apps/api/src/domain/overdue.ts               validationVisualState
apps/api/src/validations/schema.ts           Zod
apps/api/src/validations/dto.ts              serialize + visualState
apps/api/src/validations/routes.ts           HTTP
apps/api/src/store                           memory + prisma
apps/web/src/app/validacoes                  lista + ficha
apps/web/src/components/project-validations  seção na ficha do projeto
```

Contratos:

```text
POST /api/projects/:id/validations
GET  /api/projects/:id/validations
GET  /api/validations
GET  /api/validations/:id
PATCH /api/validations/:id                 ignora status
POST /api/validations/:id/transition       body { to, resultNotes? }
```

- Auth: 401 sem sessão; 403 sem membership.
- Create/get/transition fora do workspace → 404 vazio.
- Collection outro tenant → `[]`.

## Tasks (flat)

1. Domínio: máquina, events, overdue visual, sem Stage/Approval.
2. Prisma Validation + store (memory + prisma) + link opcional de checklist.
3. HTTP create/list/get/patch/transition + testes (máquina, ilegal 409, overdue, IDOR, collection vazia, checklist, stage intacta).
4. Persistência Postgres (`persist-c5.test.ts`, skip sem `DATABASE_URL`).
5. UI ficha + `/validacoes` + `/validacoes/:id` + nav + middleware.
6. Gates lint/typecheck/test/build.

## Fora de escopo

Entidade Approval (C6), portal do cliente, e-mail/WhatsApp, avanço automático de etapa ao aprovar, Playwright.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Confundir approved com Approval | Sem modelo/rota; teste de activity sem `approval.*` |
| Recuar etapa em `changes_requested` | Domínio sem Stage; assert HTTP de `Stage.status` |
| PATCH de status | Campo ignorado no schema; teste |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
