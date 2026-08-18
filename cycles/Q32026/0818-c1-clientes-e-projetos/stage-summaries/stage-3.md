# Stage 3 — Activity log

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 3 / 4
- **Próxima stage pode começar:** sim

## Entrega

`ActivityEvent` com actions `client.created|updated`, `project.created|updated`, `project.status_changed`. GET nas fichas. Payload sem telefone/e-mail. Histórico do cliente agrega eventos dos projetos.

## Evidências

Gates lint/typecheck/test/build exit 0 (incluídos na rodada Stage 3+4). Testes: `activity.test.ts`, `activity/routes.test.ts`.

## Blockers

Nenhum.
