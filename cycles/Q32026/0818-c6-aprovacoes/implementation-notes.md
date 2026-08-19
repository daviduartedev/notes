# implementation-notes.md — C6 Aprovações

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C6-D1–D22 em `plan.md`
- Grant não avança etapa; D8 mantido
- Playwright substituído por Vitest HTTP (ORCH-008)

## Execute

- **Status:** done
- **Arquivos:** `domain/approval-status.ts`, Prisma Approval, store memory+prisma, `approvals/routes.ts`, `persist-c6.test.ts`, seção na ficha, `/aprovacoes`, `/aprovacoes/:id`, nav/middleware
- **Comandos:** lint/typecheck/test/build exit 0 (128 API + 21 web); persist-c6 Postgres verde; build `ƒ /aprovacoes` e `ƒ /aprovacoes/[id]`
- **Riscos / desvios:** subjectType forçado a `project`; snapshot na ficha como JSON; C5 teste de `/api/approvals` passou de 404 para lista vazia (D8)

## Review / validate / close

- **Status:** done
- Sem blockers. Gates reais documentados em `validation.md`.
