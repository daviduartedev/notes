# Relatório C3 — Pipeline

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c3-pipeline/`
- **Data:** 2026-08-19

## Tasks

Flat Medium: domínio, store joins, `GET /api/pipeline`, persistência, UI `/pipeline`, nav/middleware — approved.

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (83 API + 15 web) |
| `pnpm build` | 0 (`ƒ /pipeline`) |
| Playwright | n/a (ORCH-008) |

## Commit / push

- Mensagem: `cycle(03): pipeline board`
- SHA: `37b15280b61bd02670cfa8bd1630db77cd713c6d`
- Push `origin main`: ok (`3cdc65d..4d6d16a`)

## Decisões

ADRs 0015–0016 em `spec/decisions.md`. Colunas por `currentStage.key`, click-only, collection vazia no tenant B.

## Deferred

Drag-and-drop, transicionar pelo board, `/hoje` operacional (C10), checklists (C4), Playwright.
