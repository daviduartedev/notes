# plan.md — Aprovações (C6)

> **Ciclo:** `0818-c6-aprovacoes`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C2 fechado; C5 fechado (D8)

---

## Resumo

Aprovação **autoriza formalmente** (proposta, escopo, protótipo, staging, produção, aceite). Entidade distinta de Validation. Snapshot JSON gerado no servidor no create. Grant **não** avança etapa. Revoke muda status para `revoked` sem apagar o registro.

## Diagnóstico — estado atual (C5)

| Área | Estado |
|------|--------|
| Prisma | Sem modelo Approval; Validation.approved não cria Approval |
| API | `GET /api/approvals` 404 de roteador (teste C5) |
| Domínio | Máquinas de Project/Stage/Validation; sem Approval |
| Web | Ficha com Etapas + Checklists + Validações; nav sem Aprovações |
| Testes | Vitest; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C6-D1 | Estados | `pending→granted\|rejected\|cancelled`; `granted→revoked` | brief |
| C6-D2 | Decide | Só `POST /api/approvals/:id/decide` body `{ action, comment? }`; actions `grant\|reject\|cancel\|revoke` | brief |
| C6-D3 | Kinds | `proposal`, `scope`, `prototype`, `staging`, `production`, `final_acceptance` | brief |
| C6-D4 | Create | Sempre `pending`; `POST /api/approvals` body `projectId` + `kind` | brief |
| C6-D5 | approverId | Sempre da sessão no decide; body ignorado; pending nasce com `approverId` null | brief |
| C6-D6 | Snapshot | Server-side no create, imutável: `currentStageKey`, `projectStatus`, `validationId`, `projectId`, `clientId` | brief |
| C6-D7 | Etapa | Grant **não** chama transition C2 | brief + request |
| C6-D8 | validationId | Opcional; tem de ser do mesmo projeto; senão 404 | brief |
| C6-D9 | Events | `approval.granted`, `approval.rejected`, `approval.revoked` no activity do **projeto**; cancelar sem event | brief |
| C6-D10 | Revoke | Mesmo row: status `revoked`, `revokedAt`; `decidedAt`/snapshot/approver do grant permanecem; não DELETE | aceite |
| C6-D11 | Isolamento | GET/decide outro tenant → 404 vazio; `GET /api/approvals` → `[]` | ORCH-006 |
| C6-D12 | Subject | `subjectType=project`, `subjectId=projectId` | request |
| C6-D13 | Quem decide | Qualquer `member`/`owner` do workspace | default C2 |
| C6-D14 | Ilegal | 409 `{ error, reason }` sem gravar event | C2 |
| C6-D15 | workspaceId | Só da sessão | ouro |
| C6-D16 | Playwright | Proibido; aceite via Vitest + guard de rota | ORCH-008 |
| C6-D17 | D8 | `Validation.status === approved` **não** cria Approval | D8 |
| C6-D18 | UI | StatusPill **green** granted; pending yellow; rejected red; cancelled purple; revoked yellow | default |
| C6-D19 | Filtros | `status`, `kind`, `projectId`, `clientId`, `approverId` | default lista |
| C6-D20 | Nested GET | `GET /api/projects/:id/approvals` para a ficha | C5 paralelo |
| C6-D21 | Sem PATCH | Status só via decide | default |
| C6-D22 | Terminais | `rejected`, `cancelled`, `revoked` sem saída; `granted` só para `revoke` | máquina |

Perguntas do `request.md` (avanço de etapa; kinds) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/approval-status.ts     máquina + events + snapshot type
apps/api/src/approvals/schema.ts           Zod
apps/api/src/approvals/dto.ts              serialize
apps/api/src/approvals/routes.ts           HTTP
apps/api/src/store                         memory + prisma
apps/web/src/app/aprovacoes                lista + ficha
apps/web/src/components/project-approvals  seção na ficha do projeto
```

Contratos:

```text
POST /api/approvals                        body { projectId, kind, validationId?, comment?, subjectType?, subjectId? }
GET  /api/approvals                        filtros; tenant B → []
GET  /api/approvals/:id                    404 IDOR
GET  /api/projects/:id/approvals           404 IDOR no projeto
POST /api/approvals/:id/decide             body { action, comment? }; 409 ilegal
```

- Auth: 401 sem sessão; 403 sem membership.
- Create/get/decide fora do workspace → 404 vazio.
- Collection outro tenant → `[]`.
- `approverId` / `workspaceId` / `status` no body são ignorados.

## Tasks (flat)

1. Domínio: máquina, events, snapshot type, sem Stage transition.
2. Prisma Approval + store (memory + prisma) + snapshot no create.
3. HTTP create/list/get/decide + testes (grant+snapshot, approver sessão, revoke, 409, IDOR, collection, D8, stage intacta).
4. Persistência Postgres (`persist-c6.test.ts`, skip sem `DATABASE_URL`).
5. UI ficha + `/aprovacoes` + `/aprovacoes/:id` + nav + middleware.
6. Gates lint/typecheck/test/build.

## Fora de escopo

Assinatura digital, portal do cliente, fundir com Validation, avanço automático de etapa, Playwright.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Confundir Validation.approved com Approval | D8: teste de approved sem criar Approval |
| Grant avançar etapa | Domínio/HTTP sem persistStageAction; assert Stage.status |
| Apagar granted no revoke | Mesmo id; teste GET após revoke |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
