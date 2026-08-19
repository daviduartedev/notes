# spec/security.md

## Tenant

- Todo dado operacional usa `workspaceId` da **sessão**, nunca do body ou query.
- Recurso de outro workspace (ou inexistente): **404** sem payload. Não usar 403 que confirme existência.
- Lookup de recurso por id é sempre scoped à sessão (`lookupForSession`). `GET /api/workspace/:id` do workspace da sessão → 200; id de outro tenant → 404 vazio. O mesmo vale para cliente, projeto, activity, transição de etapa, item de checklist, validação, aprovação, pendência, lembrete e reunião.
- `GET /api/pipeline` (collection): outro tenant recebe **colunas vazias**, nunca cards alheios. Não usar 404 em listagem.
- `GET /api/checklists` (collection): outro tenant recebe **lista vazia**.
- `GET /api/validations` (collection): outro tenant recebe **lista vazia**.
- `GET /api/approvals` (collection): outro tenant recebe **lista vazia**.
- `GET /api/blockers` (collection): outro tenant recebe **lista vazia**.
- `GET /api/reminders` (collection): outro tenant recebe **lista vazia**.
- `GET /api/meetings` (collection): outro tenant recebe **lista vazia**.
- Autenticado sem membership válida: **403**. Member tentando editar template de checklist do próprio workspace: **403**.
- Body não grava `workspaceId` nem `createdAt`. Status de validação só via `POST .../transition`. Status de Approval só via `POST .../decide`. Status de Blocker só via `POST .../decide`. Status de Reminder só via `POST .../decide`. `currentStageId` no PATCH de projeto é ignorado. `status` no PATCH de validação é ignorado. `approverId` no body de Approval é ignorado. `assigneeUserId` no body de Blocker com `assigneeKind=client` é ignorado. Participante de Meeting fora do workspace → 400.

## Auth (C0)

- Auth.js v5 credentials na API (`apps/api`).
- Sem OAuth, convite ou 2FA neste cycle.
- Sessão em cookie HttpOnly no host `localhost`, SameSite=Lax. `deleteCookie` replica os mesmos flags.
- JWT assinado com `AUTH_SECRET`. O middleware Next.js valida a assinatura (cookie forjado → `/login`).
- Logout incrementa `User.sessionVersion`. Token com versão antiga → 401 em rotas autenticadas.
- CORS: origem `http://localhost:3015` com credentials. Métodos GET, POST, PATCH, PUT, DELETE, OPTIONS.

## Secrets

- `.env` nunca vai para o git.
- `.env.example` só com placeholders.
- `AUTH_SECRET` ≥ 32 caracteres no ambiente local.

## Logs e erros

- Logger redacted: não registrar senha, `AUTH_SECRET`, `DATABASE_URL` nem tokens. Draft de lembrete (`draftMessage`) não entra no activity.
- Respostas de erro para o client **sem stack trace**.
