# C0 verify — Foundation (adversarial)

- **Cycle:** `cycles/Q32026/0818-c0-foundation/`
- **Data:** 2026-08-18
- **Verifier:** independente (contexto limpo; não confiar em `validation.md` / `c0-report.md`)
- **HEAD verificado:** `998f8893bf952fddcc670db6017d6ff1c2245247` (docs pós-foundation; produto em `7d99a9811433f3d08912059851b426bf06a9f85d`)
- **Base diff:** `git diff 293fff4..HEAD`

```txt
Verification verdict: PASS WITH GAPS
```

Nenhum finding **Critical**. Gates locais re-rodados verdes (e CI GitHub `success` nos dois pushes). C1 de produto **não** foi iniciado. Playwright **não** foi introduzido (ORCH-008).

---

## Scenario coverage

| Cenário | Teste encontrado | Asserção real? | No suite? | Status |
|---------|------------------|----------------|-----------|--------|
| Visitante não acessa o quadro | `apps/web/src/lib/route-guard.test.ts` (`loginRedirect("/hoje", false)` → `"/login"`); middleware usa o helper | Sim (lógica). Não há teste HTTP do `middleware.ts` | Sim (`vitest run`, sem skip) | PASS — smoke `:3015/hoje` visitante → **307** `Location: /login` |
| Login com o owner seed | `apps/api/src/app.test.ts` (cookie HttpOnly + `GET /api/me`); `apps/api/src/persist.test.ts` (Postgres real) | Sim para login/sessão. **Não** afirma o empty state `"quadro ainda sem operação"` | Sim; `persist` **não** skipou nesta máquina (`DATABASE_URL` presente) | PASS WITH GAP — smoke `POST /api/auth/login` 200 + `GET /api/me` 200; HTML de `/hoje` autenticado contém o empty state (produção `next start`) |
| Logout encerra a sessão | `apps/api/src/app.test.ts` — só checa `set-cookie` contém o nome do cookie | Fraca: não chama `GET /api/me` depois; passaria se o logout só reescrevesse o cookie | Sim | GAP — `deleteCookie` com `Max-Age=0` limpa o jar (401). **Replay do JWT pré-logout continua 200** em `/api/me` (sessão stateless) |
| Membro sem membership recebe 403 | `apps/api/src/app.test.ts` — `nomember@example.com` → `GET /api/me` 403 `{ error: "Sem permissão" }` | Sim para `/api/me`. Código de `/api/workspace` também 403; **sem teste HTTP** | Sim | PASS parcial — 403 live com `nomember@` não exercitável (usuário não existe no seed → 401) |
| Isolamento de workspace | `apps/api/src/workspace/scope.test.ts` (ignora body/query); `apps/api/src/app.test.ts` `GET /api/workspace?workspaceId=ws-evil` devolve `ws-1` | Sim | Sim | PASS — smoke: query `ws-evil` devolve o workspace da sessão (`Notes`) |
| Recurso de outro tenant não vaza existência | `apps/api/src/app.test.ts` stub: sessão `workspaceId: "missing"` + `getWorkspace` → `null` → 404 body vazio | Asserção 404 vazia é real, mas o When **não** pede um recurso do workspace B enquanto autenticado em A | Sim | GAP — `isCrossTenant` só existe no helper/teste; rotas C0 não fazem lookup por id de outro tenant |
| Health da API | `apps/api/src/app.test.ts` `GET /health` → `{ status: "ok" }` | Sim | Sim | PASS — smoke `:3014/health` **200** `{"status":"ok"}` |
| Design system só em desenvolvimento | `apps/web/src/lib/design-system.test.ts` (`production` → false); page chama `notFound()` | Sim no helper | Sim | PASS — `next start` (produção) `/design-system` → **404**. Dev `:3015` ficou 500 após `next build` concorrente no mesmo `.next` (contaminação do verifier, não usada no veredito) |
| Harness reconhecível | `spec/harness.md` no disco + gates | Sim (existência + gates) | Gates = suite do cycle | PASS |

---

## Gate re-run (my results vs. claimed)

Claimed: `cycles/.../validation.md` e `docs/execution/reports/c0-report.md`.

| Gate | Meu resultado | Claimed | Match? |
|------|---------------|---------|--------|
| `pnpm lint` | pass, **exit 0** | pass, 0 | Sim |
| `pnpm typecheck` | pass, **exit 0** | pass, 0 | Sim |
| `pnpm test` | pass, **exit 0** — 17 API + 7 web (persistência Postgres rodou) | pass, 0 (17+7) | Sim |
| `pnpm build` | **exit 0** na reexecução limpa (web Next 15.5.23 + api `tsc --noEmit`) | pass, 0 | Sim |
| `pnpm test:e2e` | n/a (ORCH-008, sem Playwright no repo) | n/a | Sim |

Nota (não é mismatch do produto): a **primeira** `pnpm build` nesta sessão falhou (`Failed to collect page data for /design-system`) com `next dev` ainda preso em `:3015` e `.next` em disputa. Reexecução e `pnpm --filter @notes/web build` → 0. CI `main`: `cycle(00): foundation` e o commit de docs — ambos **success**.

---

## Aceite (checagem independente)

| Critério | Evidência do verifier |
|----------|----------------------|
| Login seed → shell + `/hoje` | API 200 + `/hoje` em produção com “quadro ainda sem operação” e botão Sair |
| Visitante `/hoje` → `/login` | 307 `Location: /login` em `:3015` e em `next start` |
| Sem membership → 403 | Teste HTTP em `/api/me` com `testDeps`; seed live não tem `nomember@` |
| Health `:3014` | 200 `{"status":"ok"}` |
| Web `:3015` | login 200; `/hoje` visitante 307 |
| Nenhum secret no git | `.env` / `apps/api/.env` gitignored; `git log --all -- .env` vazio; só `.env.example` tracked |
| `workspaceId` não vem do body | `workspaceIdFromSession` descarta untrusted; `GET /workspace` só lê sessão; query maliciosa ignorada no live |

---

## Segurança

| Tema | Resultado |
|------|-----------|
| IDOR / tenant | Sem recursos endereçáveis por id no C0. Query `workspaceId` é ignorada. 404 “cross-tenant” só quando o workspace da **sessão** não existe. |
| Cookie / JWT | `authjs.session-token` HttpOnly, `SameSite=Lax`, `Path=/`, `Secure=false` (HTTP localhost). Encode/decode `@auth/core/jwt`. Middleware **não** verifica assinatura. |
| Logout | Cookie expirado (`Max-Age=0`). JWT continua válido se reenviado (stateless, sem denylist). |
| Logs PII | `redact()` cobre password/secret/token/`DATABASE_URL`. Seed loga e-mail (não exigido redigir). `onError` devolve `{ error: "Erro interno" }` sem stack. |
| `.env` commitado | Não. |

---

## Completude vs request (4 stages)

| Stage | Entregue? |
|-------|-----------|
| 1 Repo + Harness + CI | Sim: pnpm workspaces, `spec/*` de processo, `.cursor/commands/`, Compose Postgres 16 (`5433:5432`), GHA lint/typecheck/test/build + migrate, `.env.example`. Playwright do request original **omitido de propósito** (ORCH-008). |
| 2 Tokens + shell deslogado | Sim: tokens `#121212/#151515/#181818`, Caveat + IBM Plex Sans, Button/Input/Card/StatusPill, `/login`, `/design-system` 404 em production. |
| 3 Auth | Sim: credentials na API, cookie, CORS credentials, middleware `/hoje`→`/login`. Sem OAuth/2FA/convite. |
| 4 Workspace + seed + `/hoje` | Sim: Prisma User/Workspace/Member, seed 1 owner, `/health` `/api/me` `/api/workspace`, empty state, logger redacted. |
| C1 | **Não iniciado** (só `request.md`/`JANELAS.md` de bootstrap; sem models Cliente/Projeto). |

---

## Unsupported completions

Nenhuma tarefa `[x]` sem artefato no disco. Checkmarks de gates batem com a reexecução (exit 0).

Lacunas de **evidência automatizada** (não são tasks fantasmas):

- Empty state de `/hoje` não tem `expect` no Vitest (ORCH-008 impede E2E; poderia ser string/constante testada).
- 403 em `GET /api/workspace` não tem teste HTTP (só `/api/me`).
- Logout no suite não prova “deixo de acessar rotas autenticadas”.

---

## Silent contradictions

- `plan.md` desenha Postgres em `localhost:5432`; Compose/ADR-0003/`spec/database.md` usam host **5433**. ADR documenta o desvio; o plan não foi atualizado.
- `spec/security.md` afirma “recurso de outro workspace → 404”, mas no C0 não há lookup de recurso alheio — só 404 se o workspace **da sessão** não existe. `isCrossTenant` não é usado nas rotas.
- `review.md` já admite middleware só por presença de cookie; `validation.md` marca o cenário de logout/cross-tenant como pass sem essas ressalvas.

Nenhuma reversão de ADR D1–D6/D10/ORCH-004.

---

## Findings

### Critical

Nenhum.

### Important

1. **Middleware autentica por presença de cookie, não por JWT.** Cookie `authjs.session-token=forged` obtém **200** em `/hoje` (produção). Sem dados de tenant no C0, o impacto é o empty state. **C1 não pode colocar dados operacionais em páginas guardadas só assim** — validar assinatura (mesmo `AUTH_SECRET`) ou tratar `/hoje` como público vazio até lá.
2. **Logout não invalida o JWT.** Após `POST /api/auth/logout`, replay do token antigo em `GET /api/me` continua **200**. O Gherkin “deixo de acessar rotas autenticadas” vale no browser (cookie apagado), não na API. Corrigir (denylist/versão de sessão) se C1 assumir revogação server-side; senão documentar o modelo stateless.
3. **Cenário cross-tenant 404 está stubado.** Não há teste nem código de “autenticado em A, peço recurso de B”. `isCrossTenant` é morto. C1, ao criar clientes/projetos, **não herda** isolamento 404 — precisa implementar no lookup, não só ignorar `workspaceId` do body.

### Minor

- Empty state sem asserção Vitest.
- Teste de logout só olha o header `set-cookie`.
- `GET /api/workspace` 403 sem teste HTTP.
- `deleteCookie` não replica `httpOnly`/`sameSite` do `setCookie` (risco de não limpar em alguns browsers).
- `authenticate` Prisma não faz bcrypt se o e-mail não existe (oráculo de timing).
- `plan.md` ainda cita Postgres `:5432`.

---

## Verdict rationale

Os quatro stages do request existem no disco e nos testes. Os gates `lint` / `typecheck` / `test` / `build` foram re-executados com exit 0 (17+7 testes, persistência Postgres inclusa). Aceite observável de C0 (health, login seed, visitante→login, isolamento por sessão, design-system 404 em produção, harness, zero secrets no git) foi confirmado sem Playwright e sem código de C1.

O veredito não é PASS limpo porque três controles de sessão/tenant estão mais fracos do que o Gherkin/`validation.md` afirmam: guarda web por cookie opaco, logout stateless, 404 cross-tenant inacessível. Isso é **PASS WITH GAPS**, não FAIL: não há secret no git, não há gate vermelho estável, não há C1 indevido, e o isolamento `workspaceId` da sessão nas APIs C0 (`/me`, `/workspace`) está correto.

C1 pode começar desde que **não** assuma JWT verificado no Next middleware nem 404 IDOR já pronto.
