# Relatório C2 — Etapas e transições

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c2-etapas-e-transicoes/`
- **Data:** 2026-08-18

## Stages

| Stage | Status |
|-------|--------|
| 1 Domínio + matriz | approved |
| 2 Persistência + API + backfill | approved |
| 3 UI ficha | approved |
| 4 Isolamento HTTP/API | approved |

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (72 API + 13 web) |
| `pnpm build` | 0 |
| `pnpm db:migrate` | 0 (`20260818250000_stages`) |
| Playwright | n/a (ORCH-008) |

## Commit / push

- Mensagem: `cycle(02): stages and transitions`
- SHA: pending
- Push `origin main`: pending

## Decisões

ADRs 0012–0014 em `spec/decisions.md`. Template SaaS, transições sem BPM, events `stage.*`. Orchestrator: `docs/execution/DECISIONS.md`.

## Deferred

`/pipeline` (C3), checklists, validações, entidade Blocker (C7), outros templates (C11), Playwright. Reabrir etapa `completed` não entra neste cycle.
