# spec/database.md

- PostgreSQL **16** via Docker Compose (`docker-compose.yml`).
- ORM: **Prisma 6** em `apps/api`.
- Sem SQLite de produção.
- Local: Compose publica Postgres em **5433** (evita colidir com outros Postgres em 5432). CI GitHub Actions usa **5432**.

## Modelos C0 (Stage 4)

- `User` — email único, password hash, `sessionVersion` (incrementado no logout)
- `Workspace` — tenant
- `Member` — `userId` + `workspaceId` + `role` (`owner` \| `member`)

Unique `(workspaceId, userId)` em Member.

Seed: 1 workspace, 1 owner (e-mail/senha via env placeholders).
