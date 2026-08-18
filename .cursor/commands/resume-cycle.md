---
description: Re-anchor on the active cycle after a context reset (new chat/session)
---

# Resume cycle

Use this command at the start of a new chat or whenever context was lost, before doing any work. It implements the "Reancoragem após reset de contexto" policy from `spec/development-workflow.md`.

> **Do not rely on memory from a previous chat. Do not assume implicit context.**

## Instructions

1. Ask the human: **"Qual é o cycle ativo?"** (unless they already named it). Expect a path like `cycles/Q{quarter}{year}/{MMDD}-{slug}/`.
2. If unsure which is active, list the most recent folders under `cycles/` and ask the human to confirm.
3. Read, in order (skip files that do not exist):
   - `cycles/{path}/request.md`
   - `cycles/{path}/plan.md`
   - `cycles/{path}/tasks.md`
   - `cycles/{path}/scenarios.feature`
   - `cycles/{path}/spec-delta.md`
   - `cycles/{path}/implementation-notes.md`
   - `cycles/{path}/validation.md`
   - `cycles/{path}/review.md`
   - any `cycles/{path}/stage-summaries/stage-*.md`
4. Read the canonical specs referenced in `plan.md` under `spec/`.
5. Read `.cursor/rules/ai-agent.md`.

## Report

Produce a short re-anchoring summary:

- cycle path, title, and size (Small/Medium/Large)
- current state: which tasks/stages are done vs pending
- last validated state (from `validation.md`)
- for staged cycles: which stage is next and whether it is approved to start
- open risks/blockers from `implementation-notes.md` and `review.md`
- **recommended next command** (e.g. `/execute-stage`, `/review-implementation`, `/validate-cycle`, `/update-spec`, `/close-cycle`)

## Do not

- Resume execution before reporting the re-anchoring summary.
- Start or advance a stage without explicit human approval.
- Assume the cycle is valid without reading `validation.md`.
