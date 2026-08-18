# Relatório C0 — Foundation

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c0-foundation/`
- **Data:** 2026-08-18

## Stages

| Stage | Status |
|-------|--------|
| 1 Repo + Harness + CI | approved |
| 2 Tokens + shell deslogado | approved |
| 3 Auth | approved |
| 4 Workspace + seed + `/hoje` | approved |

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (17 API + 7 web) |
| `pnpm build` | 0 |
| `pnpm db:migrate` | 0 |
| `pnpm db:seed` | 0 |

Smoke: `GET http://localhost:3014/health` → 200 `{"status":"ok"}`; `GET http://localhost:3015/hoje` visitante → 307 `/login`; login seed + `/api/me` 200.

## Commit / push

- Mensagem: `cycle(00): foundation`
- SHA: `7d99a9811433f3d08912059851b426bf06a9f85d`
- Push `origin main`: ok (`293fff4..7d99a98`)

## Decisões

ADRs em `spec/decisions.md` (D1–D6, D10, ORCH-004). Orchestrator: `docs/execution/DECISIONS.md`.

## Deferred

Ver `docs/execution/DEFERRED_CONFIG.md`. Secrets só em `.env` local. Postgres local na porta host 5433.

## Como rodar

```text
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev          # web :3015 + api :3014
```
