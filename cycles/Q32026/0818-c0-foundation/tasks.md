# tasks.md — Foundation (C0)

> Large: 4 stages. Checkpoints humanos suspensos (ORCH-001); `stage-summaries/` obrigatórios.  
> Marcar `[x]` só com evidência (comando rodado).

## Stage 1 — Repo, Harness, CI

- [x] Monorepo pnpm (`pnpm-workspace.yaml`, `package.json` raiz, `packageManager: pnpm@10.x`)
- [x] TypeScript strict compartilhado (`tsconfig.base.json`)
- [x] Scaffold `apps/web` Next.js App Router (porta **3015**) que faz build
- [x] Scaffold `apps/api` Hono (porta **3014**) que faz build
- [x] Scripts raiz: `dev`, `dev:web`, `dev:api`, `lint`, `typecheck`, `test`, `build`, `db:migrate`, `db:seed`
- [x] ESLint (flat) + Vitest workspace
- [x] `docker-compose.yml` PostgreSQL 16
- [x] `.env.example` sem secrets reais (`DATABASE_URL`, `AUTH_SECRET`, `WEB_ORIGIN`, `SEED_OWNER_*` placeholders)
- [x] Specs de processo em `spec/`: `harness.md`, `development-workflow.md`, `security.md`, `backend.md`, `frontend.md`, `database.md`, `testing.md`, `code-style.md`, `README.md`
- [x] Portar comandos SDD relevantes para `.cursor/commands/` (adaptar pnpm; não exigir plugins)
- [x] GitHub Actions: lint + typecheck + test + build (Node 22, pnpm; Postgres service se testes de persistência existirem nesta stage)
- [x] `.gitignore` cobre `.env`, `node_modules`, builds, `.serena`
- [x] Gate Stage 1: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`

## Stage 2 — Tokens e shell deslogado

- [x] Tokens CSS: `#121212` / `#151515` / `#181818`, bordas discretas, semântica verde/amarelo/vermelho/azul/roxo
- [x] Fontes: Caveat (títulos/labels) + IBM Plex Sans (next/font)
- [x] Primitivos: `Button`, `Input`, `Card`, `StatusPill`
- [x] `/login` layout (sem board operacional)
- [x] `/design-system` só em development (404 em produção)
- [x] Sem implementação de board/clientes/projetos
- [x] Gate Stage 2: lint/typecheck/test/build

## Stage 3 — Auth

- [x] Auth.js v5 (`@auth/core`) credentials: login / logout / sessão JWT em cookie HttpOnly
- [x] Cookie + CORS explícito `http://localhost:3015` com credentials
- [x] Proteção de rotas autenticadas no web (visitante → `/login`)
- [x] Sem OAuth, convite, 2FA
- [x] Testes unitários: sessão (encode/decode), lógica de proteção de rota
- [x] Gate Stage 3: lint/typecheck/test/build

## Stage 4 — Workspace + seed + `/hoje`

- [x] Prisma: `User`, `Workspace`, `Member` (`owner` \| `member`)
- [x] `workspaceId` somente da sessão (ignorar body/query)
- [x] Seed: 1 workspace, 1 owner (placeholders no `.env.example`)
- [x] `GET /health`, `GET /api/me`, `GET /api/workspace`
- [x] Sem membership válida → 403; recurso de outro workspace → 404 vazio
- [x] `/hoje` empty state: “quadro ainda sem operação”
- [x] Logger redacted; erros de API sem stack no client
- [x] Testes: membership 403, health, isolamento workspace em `me`/`workspace`
- [x] Gate Stage 4: lint/typecheck/test/build

## Fechamento do cycle

- [x] `review.md` (cycle completo)
- [x] `validation.md` com gates reais
- [x] Promover `spec-delta.md` via update-spec (somente o entregue)
- [x] ADRs D1–D10 e ORCH-004 em `spec/decisions.md`
- [x] `CLOSURE.md`
- [x] Commit `cycle(00): foundation` + push `origin main`
