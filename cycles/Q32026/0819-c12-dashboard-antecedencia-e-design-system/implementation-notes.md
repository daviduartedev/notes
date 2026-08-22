# implementation-notes.md — C12

Diário técnico. Large: atualizar a cada stage.

## Stage 1

- Status: **done**
- Nav/H1: Dashboard; rota `/hoje`; coluna Hoje intacta
- AppShell: `page-shell` + `--page-gutter` / `--page-max`; nav centrada
- Copy de erro: `HOJE_LOAD_ERROR` = "Não foi possível carregar o dashboard."

## Stage 2

- Status: **done**
- `lucide-react@1.33.0` em `apps/web` + `pnpm-lock.yaml`
- FilterBar + Select `min-w-[16rem]` nas listas com “Todos os responsáveis”
- Ícones no quadro (Bell, ChevronRight); galeria em `/design-system`

## Stage 3

- Status: **done**
- `Workspace.attentionLeadDays` (migration `20260819210000_attention_lead_days`)
- PATCH `/api/workspace`; POST `/api/reminders` `policyKey=manual`
- Input de antecedência na coluna Precisa de atenção; form em `/lembretes` e ficha do projeto

## Base main (esta janela)

- Branch `cycle/c12-dashboard-antecedencia-e-design-system` estava em `0ec7d0f` (equivalente a `4706d59`, sem o proxy de prod).
- Cherry-pick de `origin/main`: `9a7b94f` → `eec003c` → `129ae8f` → `f8f865d` → `f29eef6`.
- HEAD atual: `65aa766` (conteúdo do proxy Route Handler). `apps/web/src/app/api/[...path]/route.ts` no build; `next.config.ts` sem rewrites.
- Conflitos do stash resolvidos a favor do proxy de `main` (não reabrir deploy).

## Comandos (esta janela)

- `pnpm install` — ok (`lucide-react` no lockfile)
- `pnpm --filter @notes/api db:generate` — ok
- `pnpm lint` — ok
- `pnpm typecheck` — ok
- `pnpm --filter @notes/web test` — 29 passed
- `pnpm --filter @notes/api exec vitest run --exclude "src/persist*.test.ts"` — 181 passed (domínio + HTTP C12)
- `pnpm test` (sem exclude) — 14 persist timeout 5s (ver riscos)
- `pnpm build` — ok; rota `ƒ /api/[...path]`; warning jose/Edge Runtime pré-existente

Não rodei `db:migrate` nesta janela (Docker Desktop parado; `.env` local aponta para host remoto — não migrar prod daqui).

## Desvios

- Stages 1–3 já estavam implementadas no WIP; esta janela reancorou na base `f29eef6`, fechou lockfile do lucide e revalidou gates.
- shadcn: lucide + primitivos existentes; sem CLI shadcn completa.
- `alert` no card de hoje é opcional no JSON (true só na antecedência).

## Riscos

- Suite `persist*.test.ts` (14) timeout: Docker não está no ar (nada em `:5433`) e o `DATABASE_URL` do `.env` não é o postgres local do compose. Falha de ambiente, não de domínio C12. CI sobe postgres 16 e deve cobrir esses 14.
- Fora do `tasks.md` (não incluir no PR de feat): `apps/api/src/seed-clients.ts`, `data/`, `docs/execution/`, `scripts/sync-web-env.mjs`, `apps/web/.env.example`.
- `cycles/` e `spec/` fora do escopo do PR de feat; `spec-delta.md` só via `/update-spec` depois da validation.
