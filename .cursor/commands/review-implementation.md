---
description: Review implementation against cycle plan and specs (read-only by default)
---

# Review implementation

Compare changed code/docs against the cycle artifacts and canonical specs.

## Prerequisites

Read:

- `request.md`, `plan.md`, `tasks.md`, `scenarios.feature`
- `spec-delta.md`, `implementation-notes.md`, `validation.md` (if exist)
- Relevant `spec/` docs
- [`.cursor/rules/ai-agent.md`](../rules/ai-agent.md)

## Instructions

1. Identify files changed in this cycle (git diff or implementation-notes).
2. Compare against:
   - scope in `request.md` and `plan.md`
   - tasks marked complete in `tasks.md`
   - acceptance scenarios in `scenarios.feature`
   - planned spec changes in `spec-delta.md`
3. Verify:
   - **Scope:** no out-of-scope product/UX/API/database changes
   - **Security:** auth, IDOR, validation, LGPD when applicable ([`spec/security.md`](../../spec/security.md))
   - **Tests:** coverage aligned with [`spec/testing.md`](../../spec/testing.md)
   - **Backend:** [`spec/backend.md`](../../spec/backend.md)
   - **Database:** [`spec/database.md`](../../spec/database.md) if migrations touched
   - **Frontend:** [`spec/frontend.md`](../../spec/frontend.md) if UI touched
   - **Code style:** [`spec/code-style.md`](../../spec/code-style.md)
4. Produce structured report:

### Blockers
Issues that must be fixed before merge/close.

### Warnings
Should fix; not strictly blocking.

### Suggestions
Optional improvements (defer if out of scope).

5. For large cycles: populate or update `review.md` with findings.

## Do not

- Change code unless explicitly asked by the user.
- Mark cycle as valid if critical blockers remain undocumented.
