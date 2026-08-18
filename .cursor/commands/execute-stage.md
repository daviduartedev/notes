---
description: Execute tasks.md — one stage at a time (staged cycles) or all in order (flat cycles)
---

# Execute stage

Execute the current cycle's `tasks.md`. Two modes, decided by how `tasks.md` is structured:

- **Staged mode** (`tasks.md` has `## Stage N` headings — typically Large cycles): run **one stage only**, then stop for human approval before the next.
- **Flat mode** (`tasks.md` is a single ordered checklist — Small/Medium cycles): run all tasks in order in one pass.

If the user names a stage (e.g. "Stage 2"), force staged mode for that stage. If `tasks.md` has no stage headings and no stage is named, use flat mode.

## Prerequisites

Read before executing:

- `request.md`
- `plan.md`
- `tasks.md`
- `scenarios.feature`
- `spec-delta.md` (if exists)
- Relevant specs under `spec/`
- [`.cursor/rules/ai-agent.md`](../rules/ai-agent.md)

## Instructions

1. Determine the mode (staged vs flat) per the rule above.
2. **Staged:** execute **only** tasks in the target stage — do not proceed to the next stage. **Flat:** execute all tasks in `tasks.md` in order.
3. Respect scope in `request.md` and `plan.md`; no out-of-scope fixes.
4. Update `implementation-notes.md` with:
   - stage number and status
   - files created/changed
   - commands run and results
   - risks and deviations from plan
5. Run validations relevant to this stage (lint, typecheck, tests as applicable).
6. Report summary:
   - tasks completed vs. pending in the stage
   - files altered
   - commands run
   - failures (document pre-existing baseline failures separately)
   - risks and blockers
7. **Staged mode:** stop and wait for human approval before the next stage. **Flat mode:** stop after the full checklist; next step is `/review-implementation` or `/validate-cycle`.

## Do not

- Start the next stage without explicit human approval (staged mode).
- Mark tasks complete without evidence.
- Alter `spec/` directly when `spec-delta.md` policy applies — use `update-spec` after validation.
