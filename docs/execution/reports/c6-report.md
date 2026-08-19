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
- SHA: `98c25a6254347739d79aa99edec2e2e22c663855`
- Push `origin main`: ok (`8cdac5c..98c25a6`)

## Decisões

ADRs 0021–0022 em `spec/decisions.md`. Approval ≠ Validation. Grant não avança etapa. Snapshot server-side. Revoke append-only.

## Deferred

Avanço automático de etapa, assinatura digital, portal do cliente, Playwright.
