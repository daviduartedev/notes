# plan.md — Foundation (C0)

> **Ciclo:** `0818-c0-foundation`  
> **Tipo:** Large (4 stages)  
> **Data:** 18/08/2026  
> **Branch:** `main` (ORCH-009; sem PR `develop` / board Orbe)

---

## Resumo

Fundar o repositório Notes: monorepo pnpm, Harness SDD, CI, PostgreSQL 16, shell visual escuro, Auth.js credentials na API, um workspace seed e `/hoje` vazio. Não entrega clientes, projetos nem board operacional.

## Diagnóstico — estado atual

| Área | Estado |
|------|--------|
| App | Inexistente (`apps/` vazio) |
| `spec/` | Inexistente |
| CI | Inexistente |
| Auth / banco | Inexistentes |
| Cycles | `request.md` + `JANELAS.md` de C0–C11 no disco |

## Decisões de produto (refinamento — fechadas pelo Orchestrator)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| D1 | Pasta | Manter `internal/notes` | request + ORCH |
| D2 | Nome | **Notes**; copy “quadro operacional” | request |
| D3 | Persistência | PostgreSQL 16 + Prisma + Docker Compose | request + ORCH-010 |
| D4 | Auth | Auth.js v5 credentials na **API** (não OAuth/2FA/convite) | request + ORCH-004 |
| D5 | RBAC | `owner` \| `member` | request |
| D6 | Idioma | enums EN; UI/docs pt-BR | request |
| D10 | Tipografia | Caveat (títulos/labels) + IBM Plex Sans | ORCH-007 |
| — | Package manager | **pnpm** workspaces, Node 22 | ORCH-005 |
| — | Arquitetura | `apps/web` Next.js :3015 + `apps/api` Hono+Prisma+Auth.js :3014 | ORCH-004 |
| — | Cross-tenant | **404** sem payload | ORCH-006 |
| — | Sem membership | **403** | ORCH-006 |
| — | E2E browser | Proibido nesta execução; Vitest | ORCH-008 |
| — | `workspaceId` | Só da sessão, nunca do body/query | AGENTS.md |

Perguntas do `request.md` estão **todas respondidas**. Nenhuma pergunta ao humano.

## Arquitetura alvo

```text
apps/web   Next.js App Router + Tailwind     http://localhost:3015
apps/api   Hono + Prisma + Auth.js JWT       http://localhost:3014
           PostgreSQL 16 (docker compose)    localhost:5432
```

- Cookie de sessão Auth.js no host `localhost` (compartilhado entre portas) + CORS `http://localhost:3015` com credentials.
- Login/logout na API; o web consome cookie + `GET /api/me`.
- Prisma vive em `apps/api`. Sem generic repository, event bus, BPM.

## Stages

1. **Repo, Harness, CI** — workspace pnpm, specs de processo, comandos `.cursor/`, Compose, gates, GitHub Actions.
2. **Tokens e shell deslogado** — tokens escuros, primitivos, `/login`, `/design-system` (dev-only).
3. **Auth** — credentials, sessão, proteção de rotas, CORS/cookie.
4. **Workspace + seed + `/hoje`** — User/Workspace/Member, seed owner, `/api/me`, `/api/workspace`, `/hoje` empty, logger redacted.

## Fora de escopo

Clientes, projetos, etapas, RLS futuro, convite, OAuth, billing, board operacional, Playwright/Cypress, issue Orbe, PR `develop`.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Cookie cross-origin (portas 3014/3015) | Cookie host-only `localhost` + SameSite=Lax + CORS credentials |
| Auth.js CSRF em POST JSON cross-origin | Login custom JSON (`POST /api/auth/login`) usando `@auth/core/jwt` encode/decode |
| Testes sem Postgres local | Testes de domínio sem DB; persistência opcional quando `DATABASE_URL` existe; CI com service Postgres |
| Secrets no git | `.env` gitignored; só `.env.example` com placeholders |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

Smoke (não Playwright): `GET http://localhost:3014/health` e frontend em `:3015`.
