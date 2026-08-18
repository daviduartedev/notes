# implementation-notes.md — C1 Clientes e Projetos

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C1-D1–D20 em `plan.md` / `spec-delta.md`
- Playwright substituído por Vitest HTTP (ORCH-008)

## Stage 1

- **Status:** done
- **Arquivos:** `Client` Prisma, domínio `client-status`, store memory/prisma, `/api/clients`, CORS PATCH/PUT/DELETE, members, web `/clientes`, nav, middleware
- **Comandos:** lint/typecheck/test/build exit 0; migrate `20260818220000_clients`
- **Riscos / desvios:** `/projetos` placeholder até Stage 2

## Stage 2

- **Status:** done
- **Arquivos:** `Project` Prisma, domínio `project-status` + `overdue`, REST `/api/projects`, web `/projetos` e lista na ficha do cliente
- **Comandos:** lint/typecheck/test/build exit 0; migrate `20260818230000_projects`
- **Riscos / desvios:** nenhum

## Stage 3

- **Status:** done
- **Arquivos:** `ActivityEvent`, sanitizer, emissão nas mutações, GET activity, UI histórico
- **Comandos:** gates exit 0; migrate `20260818240000_activity`
- **Riscos / desvios:** histórico do cliente agrega eventos dos projetos (para `project.created` ×2 na ficha)

## Stage 4

- **Status:** done
- **Arquivos:** `persist-c1.test.ts` (dois tenants Postgres)
- **Comandos:** lint/typecheck/test/build exit 0 (53 API + 12 web)
- **Riscos / desvios:** sem Playwright (ORCH-008)
