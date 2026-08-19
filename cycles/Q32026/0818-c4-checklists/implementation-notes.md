# implementation-notes.md — C4 Checklists

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C4-D1–D17 em `plan.md`
- UI de templates adiada (seed + apply)
- Playwright substituído por Vitest HTTP (ORCH-008)

## Execute

- **Status:** done
- **Arquivos:** `domain/deploy-staging-template.ts`, `checklist-instance.ts`, `checklist-item.ts`, Prisma checklists, store memory+prisma, `checklists/routes.ts`, `persist-c4.test.ts`, seção na ficha, `/checklists`, nav/middleware
- **Comandos:** lint/typecheck/test/build exit 0 (94 API + 17 web); persist-c4 Postgres verde; build `ƒ /checklists`
- **Riscos / desvios:** `key` no template para seed idempotente; PATCH template owner-only sem UI

## Review / validate / close

- **Status:** done
- Sem blockers. Gates reais documentados em `validation.md`.
