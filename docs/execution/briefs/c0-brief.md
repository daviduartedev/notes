# Brief — Cycle 00 Agent (Foundation)

Você é o **Cycle 00 Agent**. Contexto limpo. Reconstrua tudo a partir do disco. Não pergunte nada ao humano. Não espere aprovação. Não inicie C1.

## Paths

- Workspace: `c:\dev\utopia\internal\notes`
- Cycle: `cycles/Q32026/0818-c0-foundation/`
- Tipo: Large (4 stages)
- Harness: `C:\Users\weban\.cursor\commands\`
- Estado: `docs/execution/CURRENT_STATE.md`, `DECISIONS.md`, `DEFERRED_CONFIG.md`, `ORCHESTRATOR.md`
- Relatório seu: `docs/execution/reports/c0-report.md` (criar)

## Missão completa neste único agente

Refine → Execute Stage 1 → review/validate/close-stage → Stage 2 → … → Stage 4 → update-spec → close-cycle → gates → commit `cycle(00): foundation` → push `origin main` → atualizar `docs/execution/*`.

Checkpoints humanos do Harness estão **suspensos** (ORCH-001). Ainda assim escreva `stage-summaries/stage-N.md` entre stages.

## Ler nesta ordem

1. `AGENTS.md`
2. `docs/execution/ORCHESTRATOR.md` e `DECISIONS.md`
3. `cycles/Q32026/0818-c0-foundation/request.md`
4. `cycles/Q32026/0818-c0-foundation/JANELAS.md` (fluxo; ignore “espere o humano”)
5. `C:\Users\weban\.cursor\commands\` (refine-request, execute-stage, review, validate, close-stage, update-spec, close-cycle, log-decision)
6. Referência de harness: `c:\dev\utopia\internal\cascabjj\spec\harness.md` (copiar espírito, não o produto Casca)
7. Disco atual: ainda **não há** `spec/` nem `apps/`

## Respostas já decididas (não reabrir)

| Tópico | Decisão |
|---|---|
| D1 pasta | `internal/notes` |
| D2 nome | Notes; copy “quadro operacional” |
| D3 persistência | PostgreSQL 16 + Prisma + Docker Compose |
| D4 auth | Auth.js v5 (NextAuth) credentials; sem OAuth/2FA/convite |
| D5 RBAC | `owner` \| `member` |
| D6 idioma | enums EN; UI pt-BR |
| D10 fontes | Caveat (títulos/labels) + IBM Plex Sans |
| Package manager | **pnpm** workspaces |
| Cross-tenant | **404** sem payload (ORCH-006) |
| Sem membership | 403 |
| Portas | web **3015**, api **3014** |
| Arquitetura | `apps/web` Next.js App Router; `apps/api` Hono+Prisma+Auth.js (ORCH-004) |
| E2E browser | **proibido** nesta execução (ORCH-008) — testes Vitest |
| Commits | autorizados; mensagem `cycle(00): foundation` |
| Board Orbe / PR develop | não fazer (ORCH-009); push `main` |

## Escopo C0 (do request)

### Stage 1 — Repo, Harness, CI

- Scaffold monorepo pnpm + TypeScript strict
- `spec/harness.md`, `development-workflow.md`, `security.md`, `backend.md`, `frontend.md`, `database.md`, `testing.md`, `code-style.md`
- Portar comandos relevantes para `.cursor/commands/` (cópia adaptada do harness da casa)
- ESLint, typecheck, Vitest, GitHub Actions: lint + typecheck + test + build
- `.env.example` sem secrets reais
- `docker-compose.yml` Postgres
- Scripts raiz: `dev`, `dev:web`, `dev:api`, `lint`, `typecheck`, `test`, `build`, `db:migrate`, `db:seed`
- `dev:web` usa porta 3015; `dev:api` usa 3014

### Stage 2 — Tokens e shell deslogado

- Tokens escuros `#121212` / `#151515` / `#181818`, bordas discretas, semântica verde/amarelo/vermelho/azul/roxo
- `/login` layout; `/design-system` só em development (404 em produção)
- Primitivos: button, input, card, status pill
- Sem board operacional

### Stage 3 — Auth

- Credentials login/logout/sessão
- Proteção de rotas autenticadas
- Cookie + CORS para `http://localhost:3015`

### Stage 4 — Workspace + seed + `/hoje`

- User, Workspace, Member
- `workspaceId` só da sessão
- Seed: 1 workspace, 1 owner (placeholders no `.env.example`)
- `GET /health`, `GET /api/me`, `GET /api/workspace`
- `/hoje` empty state (“quadro ainda sem operação”)
- Logger redacted; erros sem stack no client

## Fora de escopo

Clientes, projetos, etapas, RLS em tabelas futuras, convite, OAuth, billing, board operacional, BPM, generic repository, event bus, Playwright E2E.

## Aceite

- Login seed → shell + `/hoje`
- Visitante `/hoje` → `/login`
- Sem membership → 403
- CI-equivalente local verde
- `spec/harness.md` existe
- Nenhum secret no git
- `curl`/fetch `http://localhost:3014/health` e frontend em `http://localhost:3015` (subir servidores para verificar; pode parar depois)

## Implementação — regras

- TypeScript strict; Zod na fronteira da API
- Sem `any` injustificado
- Testes unitários: auth session, proteção de rota (lógica), membership 403, health, isolamento workspace nas queries `me`/`workspace`
- CI: Postgres service no GitHub Actions se testes precisarem de DB; caso contrário testes de domínio sem DB + um teste de persistência se viável
- Não implementar C1+
- Atualize `implementation-notes.md` com evidência de comandos
- ADRs em `spec/decisions.md` via padrão `/log-decision` para D1–D10 e ORCH-004

## Commit

Após gates verdes:

```text
cycle(00): foundation
```

Não commitar `.env`. Push `origin main`. Se push falhar por auth, continue local e registre em `DEFERRED_CONFIG.md`.

## Relatório (arquivo)

Escreva `docs/execution/reports/c0-report.md` com: status DONE|DONE_WITH_CONCERNS|BLOCKED, stages, gates (comando + exit code), commit SHA, push, decisões, deferred, como rodar.

No retorno desta tarefa (chat): **somente** status, SHA, resumo de 10 linhas, path do report. Não despeje logs.
