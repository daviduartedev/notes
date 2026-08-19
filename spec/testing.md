# spec/testing.md

- **Vitest** para unitário e integração leve.
- Playwright/Cypress **proibidos nesta execução** (ORCH-008).
- Cenários Gherkin mapeiam para testes de domínio/API, não para browser E2E.

## C0 obrigatório

- sessão (encode/decode)
- proteção de rota (lógica)
- membership 403
- health
- isolamento de `workspaceId` nas queries `me` / `workspace`

Testes de domínio não exigem Postgres. Teste de persistência usa `DATABASE_URL` quando disponível (CI com service Postgres).

## C1 obrigatório

- transições de `Client.status` e `Project.status`
- DTO overdue (`active` + prazo passado)
- dois projetos no mesmo cliente + `project.created` ×2
- IDOR client/project/activity → 404 vazio
- payload de activity sem telefone/e-mail

## C2 obrigatório

- matriz de transições de etapa (domínio puro)
- pulo ilegal → 409 e nenhum `stage.transitioned`
- projeto novo com 10 etapas do template SaaS
- template editado não altera instâncias já copiadas
- IDOR na transição → 404 vazio

## C3 obrigatório

- dois projetos em `currentStage.key` diferentes aparecem só na coluna certa
- collection do workspace B não contém cards do A (colunas vazias)
- `completed`/`cancelled` e projeto sem etapa atual não entram no board

## C4 obrigatório

- mesmo template em dois projetos; mutar o molde não altera instâncias
- marcar item grava `completedByUserId` + `completedAt`; event `checklist.item_completed`
- completar item não muda `Stage.status`
- IDOR `PATCH` item outro workspace → 404 vazio
- collection `GET /api/checklists` do workspace B vazia

## C5 obrigatório

- `in_review` → `changes_requested` grava `validation.changes_requested` e **não** emite `approval.*`
- `changes_requested` não muda `Stage.status`
- transição ilegal → 409 sem event
- DTO overdue (`dueDate` passado + status não terminal)
- IDOR GET/transition outro workspace → 404 vazio
- collection `GET /api/validations` do workspace B vazia

## C6 obrigatório

- grant `kind=staging` grava `approverId` da sessão, `decidedAt` e snapshot server-side
- `approverId` no body é ignorado
- revoke não apaga o registro (`id` igual, status `revoked`, `decidedAt` intacto)
- decisão ilegal → 409 sem event
- grant **não** muda `Stage.status`
- `Validation.approved` **não** cria Approval nem emite `approval.*`
- IDOR GET/decide outro workspace → 404 vazio
- collection `GET /api/approvals` do workspace B vazia

## C7 obrigatório

- Blocker open na etapa atual impede `complete` (409, motivo de pendência)
- resolve desbloqueia sem avançar `currentStageKey`
- `assigneeKind=client` grava `assigneeUserId` null
- Blocker **não** é ChecklistItem
- decisão ilegal → 409 sem event extra
- IDOR GET/decide outro workspace → 404 vazio
- collection `GET /api/blockers` do workspace B vazia

## C8 obrigatório

- política `proposalWaitingClientFollowUp` com relógio fake: `waiting_client` + 3 dias cria Reminder
- segundo GET não duplica scheduled/due
- snooze volta para scheduled com +7 dias; complete → done
- activity `reminder.created` sem texto do draft
- IDOR GET/decide outro workspace → 404 vazio
- collection `GET /api/reminders` do workspace B vazia


