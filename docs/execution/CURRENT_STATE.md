# CURRENT_STATE

Atualizado: 2026-08-19 (C4 — SHA no relatório).

## Produto

- Nome interno de UI: **Notes**
- Tipo: Software House Operating System / Delivery CRM
- Entidade operacional: **Project** (C1 envelope + C2 etapas + C3 board + C4 checklists)
- Tenant: `workspaceId` sempre da sessão, nunca do body

## Stack (C0 + C1 + C2 + C3 + C4)

- Monorepo **pnpm** (Node 22)
- `apps/web` — Next.js App Router + Tailwind — porta **3015**
- `apps/api` — Hono + Prisma 6 + Auth.js credentials — porta **3014**
- PostgreSQL 16 via Docker Compose (host local **5433**; CI **5432**)
- Zod, Vitest, ESLint
- Enums de domínio em inglês; UI e docs em português

## O que já existe no repo

- Harness em `spec/` + `.cursor/commands/`
- Auth credentials, seed 1 workspace + 1 owner + template SaaS delivery + checklist Deploy Staging SaaS
- `/login`, `/hoje` empty state, `/design-system` (dev)
- `/clientes`, `/clientes/:id`, `/projetos`, `/projetos/:id` (Etapas + Checklists)
- `/pipeline` board por etapa atual (click-only)
- `/checklists` lista de instâncias
- CI GitHub Actions (lint, typecheck, test, build + migrate)

## Auth / banco / módulos

- Auth: credentials na API, cookie `authjs.session-token`
- Banco: User, Workspace, Member, Client, Project, ActivityEvent, WorkflowTemplate, StageTemplate, Stage, ChecklistTemplate, ChecklistTemplateItem, ProjectChecklist, ChecklistItem
- Módulos: clientes, projetos, activity, etapas, pipeline board, checklists

## Contratos

- C0: `GET /health`, login/logout, `/api/me`, `/api/workspace`
- C1: `/api/clients`, `/api/projects`, `/api/workspace/members`, activity nas fichas
- C2: `POST /api/projects/:id/stages/:stageId/transition`; GET ficha com `stages`
- C3: `GET /api/pipeline` → `{ columns }`
- C4: apply/list checklists; `PATCH /api/checklist-items/:id`; templates owner-only
- Cross-tenant → 404 vazio em recurso por id; collection pipeline/checklists → vazio
- Sem membership → 403
- CORS inclui PATCH/PUT/DELETE
- `visualState: overdue` para projeto `active` com prazo passado
- PATCH `currentStageId` ignorado
- Completar checklist **não** muda `Stage.status`

## Como rodar

```text
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Dependências externas

- Docker Desktop
- Node 22, pnpm 10
- Origin `https://github.com/daviduartedev/notes.git`
