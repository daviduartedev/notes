# CURRENT_STATE

Atualizado: 2026-08-18 (C0 fix `173781ee960650f3697a445cea17bb8355071d22`).

## Produto

- Nome interno de UI: **Notes**
- Tipo: Software House Operating System / Delivery CRM
- Entidade operacional: **Project** (ainda não implementada — C1)
- Tenant: `workspaceId` sempre da sessão, nunca do body

## Stack (entregue no C0)

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
- CI GitHub Actions (lint, typecheck, test, build + migrate)

## Auth / banco / módulos

- Auth: credentials na API, cookie `authjs.session-token`
- Banco: User (`sessionVersion`), Workspace, Member
- Módulos de domínio: nenhum além de workspace (clientes/projetos = C1)

## Contratos

- `GET http://localhost:3014/health` → `{ "status": "ok" }`
- `POST /api/auth/login` `{ email, password }`
- `GET /api/me`, `GET /api/workspace`, `GET /api/workspace/:id` (403 sem membership; 404 cross-tenant)
- Visitante ou JWT inválido em `/hoje` → `/login`
- Logout incrementa `sessionVersion` (replay do JWT → 401)

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
