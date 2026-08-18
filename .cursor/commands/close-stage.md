---
description: Close a completed stage in a Large SDD Harness cycle
---

# Close Stage

Use this command after a stage has been implemented, reviewed, and manually/automatically validated.

## Goal

Consolidate the current stage status before moving to the next stage.

This is not a canonical spec update.  
This command must not promote `spec-delta.md` into `spec/`.

This command may optionally create commits for the completed stage only when the human explicitly requests it by writing: **"e faça os commits"**.

## Inputs

The agent must read:

- `request.md`
- `plan.md`
- `tasks.md`
- `scenarios.feature`
- `spec-delta.md`
- `implementation-notes.md`
- `validation.md`
- `review.md`
- relevant `spec/` docs
- `.cursor/rules/ai-agent.md`

## Instructions

1. Identify the stage being closed.
2. Confirm the stage was executed.
3. Confirm no later stage was started.
4. Review `tasks.md` for the stage:
   - completed tasks
   - incomplete tasks
   - deferred tasks
   - partial tasks
5. Review `implementation-notes.md`.
6. Review `validation.md`.
7. Review `review.md`.
8. Produce a Stage Closing Summary and **write it to `stage-summaries/stage-{N}.md`** in the cycle folder (create the `stage-summaries/` directory if it does not exist). The summary contains:

   - stage name and number
   - status: approved / approved with caveats / pending / failed
   - what was implemented
   - files changed
   - migrations created, if any
   - commands run
   - validation results
   - manual smoke results
   - scenarios covered
   - known limitations
   - deferred items
   - scope confirmation
   - risks for next stages
   - whether the next stage is allowed to start

9. Update:
   - `stage-summaries/stage-{N}.md` (the closing summary from step 8)
   - `implementation-notes.md`
   - `validation.md`
   - `review.md`

10. Do not alter product code.
11. Do not run new implementation.
12. Do not update canonical specs under `spec/`.
13. Do not start the next stage.

## Optional commit mode

Commit mode is disabled by default.

Only enter commit mode when the human explicitly includes the phrase:

> e faça os commits

If that phrase is not present, do not create commits.

### Commit mode goal

Create one or more safe commits for the completed stage, containing only the work related to that stage and its Harness artifacts.

### Commit mode rules

1. Do not commit secrets or sensitive information.
2. Do not commit `.env`, `.env.*`, credentials, tokens, API keys, database URLs, private keys, dumps, logs with sensitive data, real CPF/CNPJ, real customer data, or production data.
3. Do not commit build outputs, caches, generated folders or dependency folders unless explicitly required by the project:
   - `node_modules/`
   - `.next/`
   - `dist/`
   - `build/`
   - `coverage/`
   - logs
   - temporary files
4. Do not commit unrelated changes from other stages.
5. Do not commit changes from later stages.
6. Do not commit broad cleanup unrelated to the stage.
7. Do not run `git push` from this command.
8. Do not use `git add .` blindly.
9. Stage files selectively with explicit paths.
10. Before committing, inspect:

   - `git status`
   - `git diff --stat`
   - `git diff`
   - `git diff --cached --stat`
   - `git diff --cached`

11. Search the diff for sensitive patterns before committing, including:

   - `.env`
   - `DATABASE_URL`
   - `SECRET`
   - `TOKEN`
   - `API_KEY`
   - `PRIVATE_KEY`
   - `PASSWORD`
   - `CPF`
   - `CNPJ`
   - real e-mails
   - real phone numbers
   - customer data

12. If any sensitive information is found, stop and report. Do not commit.
13. If the stage is pending or failed, do not commit unless the human explicitly asks for a WIP commit.
14. If validations failed because of changes in this stage, do not commit until fixed or explicitly approved.
15. If validations failed because of pre-existing baseline issues, document that clearly in `validation.md` and in the commit summary.

### Commit grouping

Prefer one commit per completed stage.

Default commit message format:

```txt
feat(stage-{N}): <short summary>