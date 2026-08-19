# Relatório C8 — Lembretes / follow-ups

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c8-lembretes/`
- **Data:** 2026-08-19

## Tasks

Flat Medium: domínio da máquina + política com fake clock, Prisma Reminder + lastInteractionAt, HTTP evaluate on-read + decide, persistência, UI ficha + `/lembretes` + `/lembretes/:id`, nav/middleware — approved.

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (159 API + 25 web) |
| `pnpm build` | 0 (`ƒ /lembretes`, `ƒ /lembretes/[id]`) |
| Playwright | n/a (ORCH-008) |

## Commit / push

- Mensagem: `cycle(08): reminders`
- SHA: (HEAD após o commit deste close)
- Push `origin main`: (após push)

## Decisões

ADRs 0025–0026 em `spec/decisions.md`. Canal `internal`. Política `proposalWaitingClientFollowUp`. Evaluate on-read. Snooze → scheduled +7d. Draft fora do activity.

## Deferred

WhatsApp, e-mail, Calendar, motor genérico, `/hoje` operacional (C10), Playwright.
