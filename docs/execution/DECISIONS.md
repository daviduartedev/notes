# DECISIONS

Decisões assumidas autonomamente pelo Orchestrator / Cycle Agents. Complementa `spec/decisions.md` (ADRs) quando este existir após C0.

---

## ORCH-001 — Checkpoints humanos do Harness suspensos nesta execução

- **Data:** 2026-08-18
- **Status:** Accepted (escopo desta execução autônoma)
- **Decisão:** Mandato Autonomous Multi-Agent Delivery substitui gates humanos entre refine/execute/stage/cycle. Stages Large correm em sequência no mesmo Cycle Agent. Artefatos de stage (`stage-summaries/`) continuam obrigatórios.
- **Não cobre:** hard blockers reais (secrets impossíveis, repo inacessível, etc.).

## ORCH-002 — Commits e push autorizados por cycle

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Cada cycle fechado gera commit `cycle(NN): …` em `main` e `git push`. Equivale a **"e faça os commits"** + **"e faça push"** do Harness.
- **Não commitar:** `.env`, secrets, `node_modules`, build.

## ORCH-003 — Portas locais obrigatórias

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Frontend `3015`, API `3014`. Health na API. Não usar 3000/3001/5173/8080 como portas principais.

## ORCH-004 — App split web + API

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Em vez de um único Next.js (proposta original do C0), monorepo `apps/web` (Next.js :3015) + `apps/api` (Hono + Prisma + Auth.js :3014), para cumprir ORCH-003 sem fingir duas portas.
- **Auth:** credentials no API; cookie de sessão no host `localhost` (compartilhado entre portas) + CORS explícito `http://localhost:3015`.

## ORCH-005 — Package manager pnpm

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** pnpm (padrão Casca). Node 22.

## ORCH-006 — Cross-tenant retorna 404

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Recurso de outro workspace (ou inexistente) → **404** sem payload. Sem 403 que confirme existência. Membro autenticado sem membership válida → 403.

## ORCH-007 — Tipografia

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Títulos/labels do quadro: **Caveat** (SIL OFL, Google Fonts). UI restante: **IBM Plex Sans**. Não embutir fonte proprietária do Excalidraw.

## ORCH-008 — E2E browser fora desta execução

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Não criar nem rodar Playwright/Cypress E2E. Stages/cenários “E2E” viram testes de API/domínio (Vitest). Gates: lint, typecheck, unit/integration, build.

## ORCH-009 — GitHub: push em main, sem board Orbe

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** Origin `https://github.com/daviduartedev/notes.git`. Push direto em `main`. Não criar issues no board `orbe-soft/orbe-development-board` nem PRs para `develop` (repo/org diferentes; mandato pede `main`).

## ORCH-010 — Postgres via Docker Compose no C0

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** `docker-compose.yml` com PostgreSQL 16. Sem SQLite de produção. Testes de domínio podem fakear o relógio/DB em memória quando não precisarem de SQL real; testes de persistência usam Postgres de teste.

## ORCH-011 — Ordem dos cycles

- **Data:** 2026-08-18
- **Status:** Accepted
- **Decisão:** `C0 → C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C9 → C10 → C11`. Sem paralelismo entre cycles dependentes. C11 após C10 mesmo sendo pós-MVP (mandato: concluir o roadmap).
