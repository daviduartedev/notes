---
description: Validate cycle with project gates and populate validation.md
---

# Validate cycle

Run available project validation commands and record results.

## Prerequisites

Read:

- `tasks.md`, `scenarios.feature`, `plan.md`
- [`spec/testing.md`](../../spec/testing.md)
- [`spec/development-workflow.md`](../../spec/development-workflow.md)

## Commands to run (when they exist)

| Command | When |
|---------|------|
| `pnpm lint` | always |
| `pnpm typecheck` | always |
| `pnpm test` | always |
| `pnpm test:security` | if cycle touches auth/API/security |
| `pnpm audit:ci` | if cycle touches dependencies |
| `pnpm build` | always |
| `pnpm test:e2e` | **não usar nesta execução** (ORCH-008; sem Playwright/Cypress) |

If a command does not exist, note it in `validation.md`. Do not install new dependencies.

## Instructions

1. Run applicable commands sequentially; capture exit codes and summary.
2. Create or update `validation.md` in the cycle folder with:

### Gate results

| Comando | Resultado | Observacoes |
|---------|-----------|-------------|

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|

3. Map each scenario from `scenarios.feature` to evidence (automated test, manual smoke, or doc review).
4. Pre-existing failures: document as **baseline preexistente** — do not fix outside scope unless caused by this cycle.
5. List gaps and risks.
6. Do **not** consider cycle valid with undocumented critical failures.

## Status values

- `pass` — verified success
- `fail` — failed; must fix or document as accepted risk
- `n/a` — not applicable to this cycle
- `baseline` — pre-existing failure, out of scope
