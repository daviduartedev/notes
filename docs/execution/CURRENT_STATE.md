# CURRENT_STATE

Atualizado: 2026-08-18 (C1 `cycle(01): clients and projects`).

## Produto

- Nome interno de UI: **Notes**
- Tipo: Software House Operating System / Delivery CRM
- Entidade operacional: **Project** (C1 entregue; envelope de status, sem etapas)
- Tenant: `workspaceId` sempre da sessão, nunca do body

## Stack (C0 + C1)

- Monorepo **pnpm** (Node 22)
- `apps/web` — Next.js App Router + Tailwind — porta **3015**
- `apps/api` — Hono + Prisma 6 + Auth.js credentials — porta **3014**
- PostgreSQL 16 via Docker Compose (host local **5433**; CI **5432**)
- Zod, Vitest, ESLint
- Enums de domínio em inglês; UI e docs em português

## O que já existe no repo

- Harness em `spec/` + `.cursor/commands/`
- Auth credentials, seed 1 workspace + 1 owner
- `/login`, `/hoje` empty state, `/design-system` (dev)
- `/clientes`, `/clientes/:id`, `/projetos`, `/projetos/:id`
- CI GitHub Actions (lint, typecheck, test, build + migrate)

## Auth / banco / módulos

- Auth: credentials na API, cookie `authjs.session-token`
- Banco: User, Workspace, Member, Client, Project, ActivityEvent
- Módulos: clientes, projetos, activity (etapas = C2)

## Contratos

- C0: `GET /health`, login/logout, `/api/me`, `/api/workspace`
- C1: `/api/clients`, `/api/projects`, `/api/workspace/members`, activity nas fichas
- Cross-tenant → 404 vazio; sem membership → 403
- CORS inclui PATCH/PUT/DELETE
- `visualState: overdue` para projeto `active` com prazo passado

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
