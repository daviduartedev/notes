# Brief — C0 Fix Agent

Você corrige findings **Important** (e Minors baratos de teste) do C0. Não inicie C1. Não pergunte ao humano.

Workspace: `c:\dev\utopia\internal\notes`

Ler: `docs/execution/reports/c0-verify.md`, `cycles/Q32026/0818-c0-foundation/review.md`, código de auth/middleware.

## Obrigatório (Important)

1. **Middleware Next.js:** validar JWT com o mesmo `AUTH_SECRET` (não só presença do cookie). Cookie forjado → redirecionar `/login`. Teste unitário do helper de verificação (assinatura inválida / válida).
2. **Logout invalida sessão server-side:** incrementar `sessionVersion` (ou equivalente) no User no logout; `GET /api/me` com JWT antigo → 401. Login grava a versão no token. Teste de replay.
3. **Cross-tenant 404 real no C0:** helper de lookup por id scoped à sessão. `GET /api/workspace/:id` (ou rota equivalente): id do workspace da sessão → 200; id de outro workspace (seed/fixture B nos testes) → **404 body vazio**. Usar o helper nas rotas. Teste HTTP, não stub morto.

## Minors (fazer se barato)

- Asserção Vitest da copy empty state `/hoje`
- Teste HTTP 403 em `GET /api/workspace` sem membership
- Logout: após logout, cookie jar falha em `/api/me`; replay do JWT antigo também falha
- `deleteCookie` com mesmos flags `httpOnly`/`sameSite` do set
- Atualizar `plan.md` se ainda disser Postgres `:5432` como host local obrigatório (host 5433 + CI 5432)

## Depois

- `pnpm lint`, `typecheck`, `test`, `build` verdes
- Atualizar `review.md` / `validation.md` / `implementation-notes.md` / `spec/security.md` se o comportamento mudou
- Commit: `cycle(00): harden session and tenant lookup`
- Push `origin main`
- Relatório: `docs/execution/reports/c0-fix.md`

Retorno ao orchestrator: STATUS, SHA, gates. Sem logs.
