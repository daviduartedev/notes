# Stage 4 — Isolamento (API/domínio, sem Playwright)

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 4 / 4
- **Próxima stage pode começar:** não (cycle pronto para review/validate/close)

## Entrega

HTTP: avanço válido com payload de/para; pulo ilegal 409 sem `stage.transitioned`; template mutado não altera instância; IDOR 404; membro pode transicionar. Persistência Postgres em `persist-c2.test.ts`. Playwright não usado (ORCH-008).

## Evidências

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (72 API + 13 web) |
| `pnpm build` | 0 |

## Desvios

Nenhum.

## Blockers

Nenhum.

## Escopo

Sem browser E2E.
