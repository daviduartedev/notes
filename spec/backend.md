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

## Contratos C1

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| GET | `/api/workspace/members` | sessão | membros do workspace da sessão |
| GET/POST | `/api/clients` | sessão | list/create; filtros name, ownerUserId, status |
| GET/PATCH/DELETE | `/api/clients/:id` | sessão | DELETE 409 se houver projetos |
| GET | `/api/clients/:id/activity` | sessão | |
| GET/POST | `/api/projects` | sessão | filtros ownerUserId, status, clientId, prazo, priority |
| GET/PATCH/DELETE | `/api/projects/:id` | sessão | DTO `visualState` |
| GET | `/api/projects/:id/activity` | sessão | |
| POST | `/api/projects/:id/stages/:stageId/transition` | sessão | body `action` e/ou `to`; 409 ilegal sem event |

CORS: GET, POST, PATCH, PUT, DELETE, OPTIONS. `workspaceId` no body é ignorado. PATCH `currentStageId` é ignorado.

GET `/api/projects/:id` inclui `stages` (cópia da instância) e `actions` com motivo pt-BR.

## Erros

JSON `{ "error": "<mensagem segura>" }` sem stack. 404 cross-tenant vazio.
