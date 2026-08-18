# validation.md — C0 Foundation

Data: 2026-08-18. Nada de ✅ sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 17 testes API + 7 web |
| `pnpm build` | pass | 0 | Next.js 15.5 + tsc api |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |
| `pnpm db:migrate` | pass | 0 | Postgres 16 Compose :5433 |
| `pnpm db:seed` | pass | 0 | owner@example.com |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Visitante não acessa o quadro | `route-guard.test.ts` | `curl -sI :3015/hoje` → 307 `/login` | pass | |
| Login com o owner seed | `app.test.ts` + `persist.test.ts` | POST login + GET `/api/me` 200 | pass | |
| Logout encerra a sessão | `app.test.ts` logout limpa cookie | — | pass | |
| Membro sem membership recebe 403 | `app.test.ts` nomember → `/api/me` 403 | — | pass | |
| Isolamento de workspace | `scope.test.ts` ignora body/query | GET `/api/workspace?workspaceId=ws-evil` ainda devolve ws da sessão | pass | |
| Recurso de outro tenant 404 | `app.test.ts` 404 body vazio | — | pass | |
| Health da API | `app.test.ts` | `GET :3014/health` → `{"status":"ok"}` | pass | |
| Design system só em development | `design-system.test.ts` | `/design-system` 200 em dev | pass | production via `NODE_ENV` |
| Harness reconhecível | `spec/harness.md` no disco | gates verdes | pass | |

### Gaps e riscos

- Persistência depende de `DATABASE_URL`. Sem Docker local o teste `persist.test.ts` é skip; no CI o service Postgres + `prisma migrate deploy` cobrem.
