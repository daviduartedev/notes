# implementation-notes.md — C3 Pipeline

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C3-D1–D15 em `plan.md`
- Drag classificado Large → click-only neste Medium
- Playwright substituído por Vitest HTTP (ORCH-008)

## Execute

- **Status:** done
- **Arquivos:** `domain/pipeline-board.ts`, `pipeline/routes.ts`, `store` `listPipelineCards` (memory + prisma include), `persist-c3.test.ts`, `/pipeline` + `PipelineBoard`, nav/middleware
- **Comandos:** lint/typecheck/test/build exit 0 (83 API + 15 web); persist-c3 Postgres verde
- **Riscos / desvios:** colunas vêm do seed `SAAS_DELIVERY_STAGES` (não do template mutável); AppShell `max-w-none` só em `/pipeline`

## Review / validate / close

- **Status:** done
- Sem blockers. Gates reais documentados em `validation.md`.
