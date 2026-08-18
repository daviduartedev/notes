# Stage 1 — Clientes

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 1 / 4
- **Próxima stage pode começar:** sim

## Entrega

CRUD de Cliente (Prisma + domínio de transições + REST `/api/clients`), `GET /api/workspace/members`, CORS PATCH/PUT/DELETE, middleware `/clientes` e `/projetos`, nav Hoje / Clientes / Projetos, páginas `/clientes` e `/clientes/:id`.

## Evidências

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (36 API + 12 web) |
| `pnpm build` | 0 |
| `pnpm db:migrate` | 0 (`20260818220000_clients`) |

## Desvios

- `/projetos` existe como empty state até a Stage 2 (nav exigida no brief).
- Páginas de cliente são Server Components + forms client (evita lint `set-state-in-effect`).

## Blockers

Nenhum.

## Escopo

Sem Project, sem ActivityEvent, sem overdue.
