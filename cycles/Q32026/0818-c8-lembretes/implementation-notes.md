# implementation-notes.md — C8 Lembretes e follow-ups

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C8-D1–D25 em `plan.md`
- Avaliação on-read; política nomeada; canal internal
- Playwright substituído por Vitest HTTP (ORCH-008)

## Execute

- **Status:** done
- **Arquivos:** `domain/reminder-status.ts`, `domain/follow-up-policy.ts`, Prisma Reminder + lastInteractionAt, store memory+prisma, `reminders/routes.ts`, `persist-c8.test.ts`, seção na ficha, `/lembretes`, `/lembretes/:id`, nav/middleware
- **Comandos:** lint/typecheck/test/build exit 0 (159 API + 25 web); persist-c8 Postgres verde; build `ƒ /lembretes` e `ƒ /lembretes/[id]`
- **Riscos / desvios:** enum `snoozed` no banco; ação snooze grava `scheduled`. GET por id não reavalia políticas.

## Review / validate / close

- **Status:** done
- Sem blockers. Gates reais documentados em `validation.md`.
