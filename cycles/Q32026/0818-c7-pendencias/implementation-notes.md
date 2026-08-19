# implementation-notes.md — C7 Pendências / blockers

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C7-D1–D22 em `plan.md`
- Blocker ≠ Checklist; complete rejeitado com open; resolve não avança
- Playwright substituído por Vitest HTTP (ORCH-008)

## Execute

- **Status:** done
- **Arquivos:** `domain/blocker-status.ts`, invariante em `stage-transition.ts`, Prisma Blocker, store memory+prisma, `blockers/routes.ts`, `persist-c7.test.ts`, seção na ficha, `/pendencias`, `/pendencias/:id`, nav/middleware, pills pipeline
- **Comandos:** lint/typecheck/test/build exit 0 (144 API + 23 web); persist-c7 Postgres verde; build `ƒ /pendencias` e `ƒ /pendencias/[id]`
- **Riscos / desvios:** `sourceMeetingId` persistido sem UI; complete usa motivo de pendência mesmo com Stage já `blocked`

## Review / validate / close

- **Status:** done
- Sem blockers. Gates reais documentados em `validation.md`.
