# spec/security.md

## Tenant

- Todo dado operacional usa `workspaceId` da **sessão**, nunca do body ou query.
- Recurso de outro workspace (ou inexistente): **404** sem payload. Não usar 403 que confirme existência.
- Autenticado sem membership válida: **403**.

## Auth (C0)

- Auth.js v5 credentials na API (`apps/api`).
- Sem OAuth, convite ou 2FA neste cycle.
- Sessão em cookie HttpOnly no host `localhost`, SameSite=Lax.
- CORS: origem `http://localhost:3015` com credentials.

## Secrets

- `.env` nunca vai para o git.
- `.env.example` só com placeholders.
- `AUTH_SECRET` ≥ 32 caracteres no ambiente local.

## Logs e erros

- Logger redacted: não registrar senha, `AUTH_SECRET`, `DATABASE_URL` nem tokens.
- Respostas de erro para o client **sem stack trace**.
