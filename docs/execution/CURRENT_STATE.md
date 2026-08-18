# CURRENT_STATE

Atualizado: 2026-08-18 (orchestrator bootstrap, pré-C0).

## Produto

- Nome interno de UI: **Notes**
- Tipo: Software House Operating System / Delivery CRM
- Entidade operacional: **Project**
- Tenant: `workspaceId` sempre da sessão, nunca do body

## Stack (C0 a implementar)

- Monorepo **pnpm**
- `apps/web` — Next.js App Router + TypeScript + Tailwind — porta **3015**
- `apps/api` — Hono + Prisma + Auth.js (credentials) — porta **3014**
- PostgreSQL 16 via Docker Compose
- Zod, Vitest, ESLint
- Enums de domínio em inglês; UI e docs em português

## O que já existe no repo

- `AGENTS.md`, `cycles/` (C0–C11 com `request.md` + `JANELAS.md`), prompts SDD
- Sem `spec/` canônico ainda (entra no C0)
- Sem aplicação, sem CI, sem Prisma

## Auth / banco / módulos

- Auth: não implementado
- Banco: não implementado
- Módulos de domínio: nenhum (clientes/projetos começam no C1)

## Contratos previstos após C0

- `GET http://localhost:3014/health`
- `GET /api/me`, `GET /api/workspace` na API
- `/login`, `/hoje` (empty state) no frontend
- Visitante em rotas autenticadas → `/login`

## Dependências externas

- Docker Desktop disponível
- Node 22, pnpm 10, Git, gh autenticado (`daviduartedev`)
