# Stage 4 — Workspace + seed + `/hoje`

- **Status:** approved (ORCH-001)
- **Próxima stage pode começar:** não (cycle fecha)

## Entrega

Prisma User/Workspace/Member, seed owner, `GET /health`, `GET /api/me`, `GET /api/workspace`, `/hoje` “quadro ainda sem operação”, logger redacted, 403 sem membership, 404 vazio cross-tenant.

## Evidências

- `pnpm db:migrate` / `pnpm db:seed` exit 0
- Testes 17 API + 7 web
- Smoke: health 200; login seed; `/api/me` e `/api/workspace` 200; `/hoje` 307 `/login`

## Desvios

Postgres Compose na porta host **5433** (5432 alocada no ambiente local). CI permanece em 5432.
