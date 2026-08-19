# implementation-notes.md — C5 Validações

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C5-D1–D20 em `plan.md`
- Checklist C4 ligado via `checklistId` opcional
- Playwright substituído por Vitest HTTP (ORCH-008)

## Execute

- **Status:** done
- **Arquivos:** `domain/validation-status.ts`, overdue visual, Prisma Validation, store memory+prisma, `validations/routes.ts`, `persist-c5.test.ts`, seção na ficha, `/validacoes`, `/validacoes/:id`, nav/middleware
- **Comandos:** lint/typecheck/test/build exit 0 (114 API + 19 web); persist-c5 Postgres verde; build `ƒ /validacoes` e `ƒ /validacoes/[id]`
- **Riscos / desvios:** PATCH ignora `status` mesmo em terminal; sem modelo Approval; `checklistId` sem FK Prisma (evita ciclo com `ProjectChecklist.validationId`)

## Review / validate / close

- **Status:** done
- Sem blockers. Gates reais documentados em `validation.md`.
