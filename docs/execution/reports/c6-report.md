# Relatório C6 — Aprovações

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c6-aprovacoes/`
- **Data:** 2026-08-19

## Tasks

Flat Medium: domínio da máquina, Prisma, HTTP decide, persistência, UI ficha + `/aprovacoes` + `/aprovacoes/:id`, nav/middleware — approved.

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (128 API + 21 web) |
| `pnpm build` | 0 (`ƒ /aprovacoes`, `ƒ /aprovacoes/[id]`) |
| Playwright | n/a (ORCH-008) |

## Commit / push

- Mensagem: `cycle(06): approvals`
- SHA: (preenchido após commit)
- Push `origin main`: (preenchido após push)

## Decisões

ADRs 0021–0022 em `spec/decisions.md`. Approval ≠ Validation. Grant não avança etapa. Snapshot server-side. Revoke append-only.

## Deferred

Avanço automático de etapa, assinatura digital, portal do cliente, Playwright.
