# spec/security.md

## Tenant

- Todo dado operacional usa `workspaceId` da **sessão**, nunca do body ou query.
- Recurso de outro workspace (ou inexistente): **404** sem payload. Não usar 403 que confirme existência.
- Lookup de recurso por id é sempre scoped à sessão (`lookupForSession`). `GET /api/workspace/:id` do workspace da sessão → 200; id de outro tenant → 404 vazio. O mesmo vale para cliente, projeto, activity e transição de etapa.
- `GET /api/pipeline` (collection): outro tenant recebe **colunas vazias**, nunca cards alheios. Não usar 404 em listagem.
- Autenticado sem membership válida: **403**.
- Body não grava `workspaceId` nem `createdAt`. Status só via schema/transição. `currentStageId` no PATCH de projeto é ignorado.

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

- Logger redacted: não registrar senha, `AUTH_SECRET`, `DATABASE_URL` nem tokens.
- Respostas de erro para o client **sem stack trace**.
