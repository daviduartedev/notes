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

## Contratos C3

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| GET | `/api/pipeline` | sessão | `{ columns }`; filtros ownerUserId, clientId, priority; 10 colunas SaaS |

## Contratos C4

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| GET | `/api/checklist-templates` | sessão | seed Deploy Staging SaaS |
| PATCH | `/api/checklist-templates/:id` | sessão owner | 403 member; 404 IDOR |
| POST | `/api/projects/:id/checklists/apply` | sessão | body `templateId`, `stageId?`; deep copy |
| GET | `/api/projects/:id/checklists` | sessão | 404 IDOR |
| GET | `/api/checklists` | sessão | lista do workspace; tenant B → `[]` |
| PATCH | `/api/checklist-items/:id` | sessão | `{ completed, note? }`; 404 IDOR |

Completar item de checklist **não** muda `Stage.status`.

## Contratos C5

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| POST | `/api/projects/:id/validations` | sessão | create `draft`; `requesterUserId` da sessão |
| GET | `/api/projects/:id/validations` | sessão | 404 IDOR |
| GET | `/api/validations` | sessão | filtros status/projeto/cliente/revisor/prazo; tenant B → `[]` |
| GET | `/api/validations/:id` | sessão | DTO `visualState`; 404 IDOR |
| PATCH | `/api/validations/:id` | sessão | ignora `status` |
| POST | `/api/validations/:id/transition` | sessão | body `{ to }`; 409 ilegal sem event |

CORS: GET, POST, PATCH, PUT, DELETE, OPTIONS. `workspaceId` no body é ignorado. PATCH `currentStageId` é ignorado. Query `workspaceId` em `/api/pipeline` também é ignorada.

GET `/api/projects/:id` inclui `stages` (cópia da instância) e `actions` com motivo pt-BR. Completar item de checklist **não** muda `Stage.status`. `changes_requested` na validação **não** muda `Stage.status`. Grant de Approval **não** muda `Stage.status`. Blocker open a bloquear a etapa/projeto **rejeita** complete. Reminder **não** envia mensagem para fora (`channel=internal`). Meeting **não** muda `Stage.status` nem abre Blocker.

## Contratos C6

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| POST | `/api/approvals` | sessão | create `pending`; snapshot server-side; `approverId` do body ignorado |
| GET | `/api/approvals` | sessão | filtros status/kind/projeto/cliente/aprovador; tenant B → `[]` |
| GET | `/api/projects/:id/approvals` | sessão | 404 IDOR |
| GET | `/api/approvals/:id` | sessão | 404 IDOR |
| POST | `/api/approvals/:id/decide` | sessão | body `{ action, comment? }`; 409 ilegal sem event |

## Contratos C7

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| POST | `/api/blockers` | sessão | create `open`; auto-block da etapa atual; `workspaceId`/`status` ignorados |
| GET | `/api/blockers` | sessão | filtros status/assigneeKind/projeto/cliente/blocking/overdue; tenant B → `[]` |
| GET | `/api/projects/:id/blockers` | sessão | 404 IDOR |
| GET | `/api/blockers/:id` | sessão | 404 IDOR |
| POST | `/api/blockers/:id/decide` | sessão | body `{ action, notes? }`; 409 ilegal; resolve não avança etapa |

## Contratos C8

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| GET | `/api/reminders` | sessão | evaluate on-read; filtros status/projeto/cliente; tenant B → `[]` |
| GET | `/api/projects/:id/reminders` | sessão | 404 IDOR; evaluate |
| GET | `/api/reminders/:id` | sessão | 404 IDOR |
| POST | `/api/reminders/:id/decide` | sessão | body `{ action: complete\|snooze\|cancel, snoozeUntil? }`; 409 ilegal |

## Contratos C9

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| POST | `/api/meetings` | sessão | create; exige projectId ou clientId; `workspaceId` ignorado |
| GET | `/api/meetings` | sessão | filtros type/projeto/cliente/validationId; tenant B → `[]` |
| GET | `/api/meetings/:id` | sessão | 404 IDOR |
| PATCH | `/api/meetings/:id` | sessão | conteúdo; ignora vínculos e `workspaceId` |
| GET | `/api/projects/:id/meetings` | sessão | 404 IDOR |
| GET | `/api/clients/:id/meetings` | sessão | 404 IDOR |

## Erros

JSON `{ "error": "<mensagem segura>" }` sem stack. 404 cross-tenant vazio.
