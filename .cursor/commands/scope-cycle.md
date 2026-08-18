---
description: Turn a rough task draft into a validated SDD Harness cycle scope
---

# Scope Cycle

Use this command when the human provides a rough, messy, incomplete, or informal task draft and wants the agent to transform it into a clean cycle scope before creating the actual cycle.

## Goal

Transform raw input into a structured, reviewable scope that can later be passed to `/create-cycle`.

This command does not create files.

This command does not create a cycle folder.

This command does not generate `request.md`.

This command does not run `/create-cycle`.

This command does not run `/refine-request`.

This command does not implement code.

## Inputs

The human may provide:

- rough task idea
- bug report
- feature request
- list of issues
- notes from manual testing
- client feedback
- messy Trello/card content
- screenshots described in text
- unclear scope

## Must read

The agent should read only lightweight Harness context:

- `spec/harness.md`
- `spec/development-workflow.md`
- `.cursor/rules/ai-agent.md`

Read feature specs only if the affected area is obvious and necessary.

Do not read the whole codebase.

Do not inspect implementation files unless the human explicitly asks.

## Instructions

1. Parse the raw input.
2. Separate:
   - real tasks
   - unclear items
   - bugs
   - visual polish
   - feature requests
   - investigations
   - out-of-scope items
   - possible future cycles
3. Identify affected modules/features.
4. Detect if the work should be:
   - Hotfix
   - Small
   - Medium
   - Large
5. Explain the classification briefly.
6. Produce a clean scope block that the human can review.
7. Propose a cycle title and slug.
8. Propose constraints.
9. Propose references to include.
10. Propose validation expectations.
11. Identify risks and open questions.
12. Suggest whether the next step should be `/create-cycle`.

## Classification rules

### Hotfix

Use for:

- typo
- tiny UI adjustment
- one obvious bug
- 1 file
- no spec impact
- no API
- no DB
- no auth/security

### Small

Use for:

- small bugfix
- isolated UI adjustment
- simple copy/text change
- local behavior fix
- no migration
- no new API contract
- no security-sensitive behavior
- usually up to 3 product files

### Medium

Use for:

- isolated feature
- behavior change in one module
- moderate UI/API change
- spec-delta likely
- tests likely
- possible simple migration
- multiple files but no staged execution needed

### Large

Use for:

- many tasks
- multiple modules
- auth/security-sensitive work
- payment/sales/documents/data-sensitive flows
- complex migration
- large UX flow
- stages/checkpoints needed
- more than 10-15 tasks

## Output format

Return the following:

```txt
Recommended type:
<Hotfix | Small | Medium | Large>

Suggested cycle title:
...

Suggested slug:
...

Why this classification:
...

Clean scope:
...

Intent:
- ...

Constraints:
- ...

Suggested references:
- ...

Validation expectations:
- ...

Out of scope:
- ...

Risks:
- ...

Open questions:
- ...

Recommended next command:
Use `/create-cycle` with the approved scope below.

Approved scope draft:
<full copy-ready scope>