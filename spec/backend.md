# spec/backend.md

API em `apps/api` (Hono + Prisma + Auth.js), porta **3014**.

## Fronteira

- Zod em todo input HTTP.
- Sem `any` injustificado.
- Sem generic repository / event bus / BPM.

## Contratos C0 (Stage 4)

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| GET | `/health` | público | liveness |
| POST | `/api/auth/login` | público | credentials JSON |
| POST | `/api/auth/logout` | sessão | limpa cookie |
| GET | `/api/me` | sessão | 403 sem membership |
| GET | `/api/workspace` | sessão | workspace da sessão; 403 sem membership |
| GET | `/api/workspace/:id` | sessão | 200 se o id é o workspace da sessão; 404 vazio se outro tenant |

`workspaceId` no body é ignorado.

## Erros

JSON `{ "error": "<mensagem segura>" }` sem stack. 404 cross-tenant vazio.
