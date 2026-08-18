# spec-delta.md — C0 Foundation

Proposta. Promoção para `spec/` só após validação (exceto os docs de processo criados na Stage 1, que são o próprio entregável do Harness e serão confirmados no update-spec).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/README.md` | Índice do hub |
| `spec/harness.md` | Conceito SDD + Harness (espírito Casca, produto Notes) |
| `spec/development-workflow.md` | Fluxo de cycles, gates pnpm, portas 3015/3014 |
| `spec/security.md` | Auth credentials, cookie, CORS, workspaceId da sessão, 403/404, secrets, logs |
| `spec/backend.md` | `apps/api` Hono + Prisma + Auth.js, contratos C0 |
| `spec/frontend.md` | `apps/web` Next.js, tokens, tipografia, rotas C0 |
| `spec/database.md` | Postgres 16, Prisma, User/Workspace/Member |
| `spec/testing.md` | Vitest; sem Playwright nesta execução |
| `spec/code-style.md` | TS strict, Zod na fronteira, enums EN, UI pt-BR, sem `any` |
| `spec/decisions.md` | ADRs D1–D10 + ORCH-004 (append-only) |
| `spec/features/auth/readme.md` | Login/logout/sessão |
| `spec/features/workspace/readme.md` | Tenant, membership, seed |
| `spec/features/hoje/readme.md` | Empty state C0 |

## Comportamento a documentar como fato só se entregue

- Portas web 3015 / API 3014
- Cookie host-only + CORS credentials
- Cross-tenant 404 vazio; sem membership 403
- `/design-system` 404 em production
- Seed 1 workspace + 1 owner
- `/hoje` “quadro ainda sem operação”

## Promovido em 2026-08-18

Delta do C0 foi incorporado em `spec/` (harness, workflow, security, backend, frontend, database, testing, code-style, decisions, features auth/workspace/hoje).

Itens não entregues (intenção futura) permanecem fora de `spec/` como fato: clientes, projetos, board, OAuth, Playwright.

Clientes, projetos, etapas, board, OAuth, convite, Playwright, RLS amplo, billing.
