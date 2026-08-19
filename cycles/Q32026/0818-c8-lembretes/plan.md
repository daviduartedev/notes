# plan.md — Lembretes e follow-ups (C8)

> **Ciclo:** `0818-c8-lembretes`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C1 + C2 fechados; C7 no disco

---

## Resumo

Lembrete interno (`channel=internal`) com rascunho de mensagem, copiar, marcar enviado e adiar. Primeira política nomeada `proposalWaitingClientFollowUp`: projeto na etapa `waiting_client` + `lastInteractionAt` há mais de 3 dias → criar Reminder. Avaliação **on-read** de `GET /api/reminders` com relógio injetável. Nada é enviado para fora do sistema.

## Diagnóstico — estado atual (C7)

| Área | Estado |
|------|--------|
| Prisma | Sem modelo Reminder; Client tem `lastContactAt`, sem `lastInteractionAt` |
| API | `GET /api/reminders` 404 de roteador |
| Domínio | Etapa `waiting_client` existe (C2); sem política de follow-up |
| Web | Nav sem Lembretes; ficha sem seção de reminders |
| Testes | Vitest; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C8-D1 | Canal | Só `internal`; WhatsApp/e-mail/Calendar fora | brief |
| C8-D2 | Política | Código nomeado `proposalWaitingClientFollowUp`; não é engine WHEN/THEN | brief |
| C8-D3 | Gatilho | `currentStageKey=waiting_client` e `now - lastInteractionAt >= 3 dias` | brief |
| C8-D4 | Avaliação | On-read de `GET /api/reminders` chama `evaluateFollowUpPolicies(now)` antes de listar | brief |
| C8-D5 | Relógio | `deps.now()` injetável; testes de política com fake clock | brief |
| C8-D6 | Estados | `scheduled → due → done\|snoozed\|cancelled`; snooze persiste `scheduled` com nova `dueAt` | brief |
| C8-D7 | Snooze default | `+7 dias` a partir de `now` se body sem `snoozeUntil` | brief |
| C8-D8 | Draft | Template pt-BR da proposta; **não** logar texto completo (PII) | brief |
| C8-D9 | lastInteractionAt | Campo em Client e Project; atualizado em `client.created/updated`, `project.created/updated/status_changed`, `stage.*` | brief |
| C8-D10 | Polimorfismo | `subjectType`/`subjectId` + `clientId`/`projectId` denormalizados | request |
| C8-D11 | Idempotência | No máximo um Reminder `scheduled\|due` por `(projectId, policyKey)` | default |
| C8-D12 | Create HTTP | Sem POST manual neste cycle; política cria | default |
| C8-D13 | Decide | `POST /api/reminders/:id/decide` `complete\|snooze\|cancel`; status no body ignorado | default C7 |
| C8-D14 | Complete | Só de `due`; grava `done` + `doneAt`; event `reminder.completed` (sem draft) | brief (marcar enviado) |
| C8-D15 | Cancel | De `scheduled` ou `due`; sem event | default C7 |
| C8-D16 | Isolamento | GET/decide outro tenant → 404 vazio; collection → `[]` | ORCH-006 |
| C8-D17 | workspaceId | Só da sessão; body ignorado | ouro |
| C8-D18 | Ilegal | 409 `{ error, reason }` sem gravar event | C2 |
| C8-D19 | Quem muta | Qualquer `member`/`owner` | default C2 |
| C8-D20 | Playwright | Proibido; aceite via Vitest + guard de rota | ORCH-008 |
| C8-D21 | UI | `/lembretes` + `/lembretes/:id`; copiar draft, enviado, adiar; seção na ficha; nav | brief |
| C8-D22 | Nested GET | `GET /api/projects/:id/reminders` também avalia o workspace | C5/C6 paralelo |
| C8-D23 | Fallback lastInteraction | Se `lastInteractionAt` null, usa `createdAt` do projeto | default |
| C8-D24 | Promote | `scheduled` com `dueAt <= now` vira `due` na avaliação | máquina |
| C8-D25 | Envio externo | Nenhum canal de saída; `channel` gravado `internal` | request |

Perguntas do `request.md` (on-read vs POST evaluate; texto padrão) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/reminder-status.ts     máquina scheduled/due/done/snoozed/cancelled
apps/api/src/domain/follow-up-policy.ts    proposalWaitingClientFollowUp + draft template
apps/api/src/reminders/schema.ts           Zod
apps/api/src/reminders/dto.ts              serialize
apps/api/src/reminders/routes.ts           HTTP + evaluate on-read
apps/api/src/store                         memory + prisma
apps/web/src/app/lembretes                 lista + ficha
apps/web/src/components/project-reminders  seção na ficha do projeto
```

Contratos:

```text
GET  /api/reminders                        evaluate + list; filtros status/projectId/clientId
GET  /api/reminders/:id                    404 IDOR
GET  /api/projects/:id/reminders           404 IDOR no projeto; evaluate
POST /api/reminders/:id/decide             body { action: complete|snooze|cancel, snoozeUntil? }
```

- Auth: 401 sem sessão; 403 sem membership.
- Collection outro tenant → `[]`.
- `workspaceId` / `status` / `channel` / `draftMessage` no body de decide são ignorados (draft não é mutável via decide).
- Nada de webhook, WhatsApp ou e-mail.

## Tasks (flat)

1. Domínio: máquina Reminder + política com fake clock + sanitizer de draft.
2. Prisma Reminder + `lastInteractionAt` + store memory/prisma.
3. HTTP list/get/decide + evaluate on-read + testes (política, IDOR, collection, sem draft no activity).
4. Persistência Postgres (`persist-c8.test.ts`, skip sem `DATABASE_URL`).
5. UI ficha + `/lembretes` + `/lembretes/:id` + nav + middleware.
6. Gates lint/typecheck/test/build.

## Fora de escopo

WhatsApp, e-mail, Google Calendar, motor genérico de automações, `/hoje` operacional (C10), Playwright, C9+.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Duplicar reminders a cada GET | Idempotência por project+policy em scheduled/due |
| Logar draft (PII) | Sanitizer + payload de activity só com ids |
| Política disparar no create | lastInteractionAt = now no create; threshold 3 dias |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
