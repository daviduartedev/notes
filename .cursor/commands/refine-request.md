---
description: Refine a cycle request into plan/tasks and update canonical specs
---

# Refine request (Spec-Driven Development)

Use this command after a human writes `cycles/Q{quarter}{year}/{MMDD}-<slug>/request.md`.

## Goal

- Ask the user **one consolidated list of questions** to eliminate ambiguity.
- Then produce:
  - `plan.md` (delta plan)
  - `scenarios.feature` (scenario of acceptance criteria)
  - `tasks.md` (agent-executable checklist)
  - `spec-delta.md` (proposed canonical spec changes — **always**, when the cycle touches any behavior described in `spec/`)
- And update the **canonical spec hub** under `spec/` (including `spec/features/<feature>/`).

> Note: `refine-request` writes the **proposal** into `spec-delta.md`. It does NOT promote it into `spec/`. Promotion happens later via `/update-spec`, after `/validate-cycle` passes.

## Instructions

1. Locate (unless user specified it explicitly) the newest relevant cycle folder under `cycles/` and open its `request.md`.
2. Read the relevant canonical docs under `spec/` that the request references.
3. Ask the user the following questions in **one message** (grouped, answerable, no back-and-forth):

- Product and scope to have fully refined feature
- Data and integration
- UX and behavior
- Security and compliance
- Testing and rollout
- Integration contract ideas
- etc.

4. After answers are provided:
   - Draft/Update `plan.md` as the **delta** from current canonical specs.
   - Draft/Update `spec-delta.md` describing the proposed changes to canonical specs (which files in `spec/` change and how). Leave it as a proposal — do not promote.
   - For **Large** cycles, structure `tasks.md` into numbered stages (`## Stage 1`, `## Stage 2`, ...). For Small/Medium, a flat ordered checklist is fine.
   - Draft/Update `tasks.md` as a checklist that includes "Promote `spec-delta.md` via `/update-spec`" as a mandatory final task.
   - Draft/Update `scenarios.feature` as Gherkin **business-level** acceptance scenarios based on `request.md`:
     - Focus on **top user-observable behaviors**. Each scenario should answer "what does the user experience?" not "how is it implemented?"
     - Do NOT include scenarios for implementation details (e.g., specific storage keys, CSS architecture, HTML attributes, icon choices). Those belong in the feature `readme.md`.
     - Prefer Scenario Outlines over duplicate scenarios that only differ by a parameter value.
     - Each scenario title should describe a user goal or outcome, not a technical mechanism.
   - Update the relevant canonical docs in `spec/` and `spec/features/<feature>/` so they reflect the intended new current state.