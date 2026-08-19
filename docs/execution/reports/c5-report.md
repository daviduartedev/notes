# Relatório C5 — Validações

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c5-validacoes/`
- **Data:** 2026-08-19

## Tasks

Flat Medium: domínio da máquina, Prisma, HTTP transition, persistência, UI ficha + `/validacoes` + `/validacoes/:id`, nav/middleware — approved.

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (114 API + 19 web) |
| `pnpm build` | 0 (`ƒ /validacoes`, `ƒ /validacoes/[id]`) |
| Playwright | n/a (ORCH-008) |

## Commit / push

- Mensagem: `cycle(05): validations`
- SHA: _(preencher após commit)_
- Push `origin main`: _(preencher após push)_

## Decisões

ADRs 0019–0020 em `spec/decisions.md`. Validação ≠ Approval. Transição só via POST. Overdue no DTO. Checklist opcional.

## Deferred

Entidade Approval (C6), avanço automático de etapa, Playwright.
