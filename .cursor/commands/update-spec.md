---
description: Promote validated spec-delta changes to canonical spec/
---

# Update spec

Update `spec/` with **implemented and validated** behavior only.

## Policy

- `spec/` = canonical truth of what is implemented and validated.
- `spec-delta.md` = planned changes from refinement.
- Do not document intent that was not delivered.

## Prerequisites

Read:

- `spec-delta.md`
- `validation.md`
- `implementation-notes.md`
- `plan.md`, `tasks.md`
- Relevant feature specs under `spec/features/`

## Instructions

1. Confirm cycle implementation is complete and validated (or deferrals documented).
2. Read `spec-delta.md` and identify confirmed changes vs. deferred items.
3. Apply **only confirmed** changes to:
   - `spec/features/<feature>/readme.md`
   - global specs under `spec/` when affected
   - `spec/README.md` index if new docs added
4. Leave unimplemented items in `spec-delta.md` marked as deferred/not delivered.
5. Report all spec files altered.
6. Do not overwrite existing spec content blindly — integrate incrementally.

## Do not

- Promote speculative or unvalidated behavior.
- Update specs for work explicitly deferred to a future cycle.
