---
description: Close cycle with artifact checklist and commit message suggestion
---

# Close cycle

Formal cycle closure checklist.

## Prerequisites

Read:

- `request.md`, `plan.md`, `tasks.md`, `scenarios.feature`
- `validation.md`
- `spec-delta.md`, `implementation-notes.md`, `review.md` (as applicable)
- [`spec/development-workflow.md`](../../spec/development-workflow.md)

## Required artifacts by size

### Small
- [ ] `request.md`
- [ ] `tasks.md`
- [ ] `validation.md`

### Medium
- [ ] `request.md`
- [ ] `plan.md`
- [ ] `tasks.md`
- [ ] `scenarios.feature`
- [ ] `validation.md`
- [ ] `spec-delta.md` (when specs affected)

### Large
- [ ] `request.md`
- [ ] `plan.md`
- [ ] `tasks.md` (by stages)
- [ ] `scenarios.feature`
- [ ] `implementation-notes.md`
- [ ] `validation.md`
- [ ] `spec-delta.md`
- [ ] `review.md`

## Instructions

1. Verify all required artifacts exist for the cycle size.
2. Verify `tasks.md` complete or deferrals documented with justification.
3. Verify `validation.md` populated; no undocumented critical failures.
4. Verify `spec/` updated via `update-spec` when applicable.
5. Confirm GitHub artifacts when applicable:
   - [ ] Issue URL no board Orbe (via `/create-issue`)
   - [ ] PR URL(s) no(s) repo(s) afetado(s) (via `/open-pr`)
   - [ ] URLs registradas no resumo de fechamento
6. Generate final summary:
   - what was delivered
   - how to use outcomes
   - Harness commands used
   - v1 limitations
   - recommended next steps (if issue/PR not yet created: run `/create-issue` then `/open-pr`)
6. Suggest commit message (Conventional Commits, English), e.g.:

```
docs(harness): add SDD harness foundation cycle
```

## Do not

- Close cycle with missing critical artifacts without explicit human acceptance.
- Suggest force-push or destructive git operations.
