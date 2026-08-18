# request.md — Foundation (C0)

> **Ciclo:** `0818-c0-foundation`  
> **Tipo:** Large  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c0-foundation/`  
> **Depende de:** —  
> **Libera:** C1

---

## Contexto

O workspace `c:\dev\utopia\internal\notes` está vazio: sem git útil de produto, sem `spec/`, sem app, sem CI. O produto é um **Delivery OS** para software house (projeto como entidade operacional, multi-tenant).

Este cycle é de **fundação**. Não entrega clientes nem projetos. Entrega o chão para o slice vertical (C1–C2).

Processo: SDD no padrão Elli (`C:\dev\orbesoft\elli\cycles`) + Harness da casa (CascaBJJ / Lignum / Movix).

---

## Decisões propostas (confirmar no refine)

| # | Tópico | Proposta |
|---|--------|----------|
| D1 | Pasta do repo | Manter `internal/notes` neste cycle |
| D2 | Nome de produto na UI | **Notes** internamente; copy “quadro operacional” — nome comercial pode esperar |
| D3 | Persistência | PostgreSQL + Prisma |
| D4 | Auth | NextAuth v5 + credentials |
| D5 | RBAC | `owner` \| `member` |
| D6 | Código vs UI | enums EN; UI pt-BR |
| D10 | Tipografia | manuscrita (Virgil/Excalifont ou equivalente licenciado) em títulos/labels; IBM Plex ou Inter no restante |

---

## Objetivo

Repositório executável: Harness SDD, Next.js, auth, um workspace, shell visual escuro, CI e gates.

Ao final: usuário seed faz login e vê o shell + `/hoje` vazio (“quadro ainda sem operação”).

---

## Escopo

### Stage 1 — Repo, Harness, CI

- Scaffold Next.js App Router + TypeScript
- `spec/harness.md`, `spec/development-workflow.md`, `spec/security.md`, `spec/backend.md`, `spec/frontend.md`, `spec/database.md`, `spec/testing.md`, `spec/code-style.md`
- Portar comandos/templates Harness para `.cursor/` quando couber (sem exigir plugins)
- ESLint, typecheck, Vitest, Playwright (smoke mínimo), GitHub Actions: lint + typecheck + test + build
- `.env.example` sem secrets reais

### Stage 2 — Tokens e shell deslogado

- Tokens escuros (`#121212` / `#151515` / `#181818`), bordas discretas, cores semânticas (verde/amarelo/vermelho/azul/roxo)
- Par tipográfico manuscrito + interface
- `/login` layout; `/design-system` só em development (404 em produção)
- Primitivos mínimos: button, input, card, status pill — sem board operacional

### Stage 3 — Auth

- NextAuth credentials
- Login / logout / sessão
- Proteção de rotas autenticadas
- Sem OAuth, sem convite, sem 2FA

### Stage 4 — Workspace + seed + `/hoje` placeholder

- `User`, `Workspace`, `Member`
- `workspaceId` sempre da sessão
- Seed: 1 workspace, 1 owner
- `GET /api/me`, `GET /api/workspace`
- `/hoje` empty state
- Logger redacted; erros sem stack no client

---

## Fora de escopo

- Clientes, projetos, etapas, pipeline
- RLS em tabelas futuras (só o que este cycle criar)
- Convite de membros, OAuth, billing
- Componentes de board além de tokens/shell
- Motor de workflow, generic repository, event bus

---

## Critérios de aceite

- [ ] Login com seed acessa o shell e `/hoje`
- [ ] Visitante em `/hoje` vai para `/login`
- [ ] Membro sem membership válido recebe 403
- [ ] CI verde (lint, typecheck, test, build)
- [ ] Harness reconhecível (`spec/harness.md` + este cycle)
- [ ] Nenhum secret no git

---

## Stages previstas

1. Repo + Harness + CI  
2. Tokens + shell deslogado  
3. Auth  
4. Workspace + seed + `/hoje` placeholder  

---

## Pontos que o refinamento deve esclarecer (uma lista só)

- Confirmar D1–D6 e D10
- Package manager: pnpm (casa Casca) vs npm (Elli/Lignum)
- 404 vs 403 em recurso inexistente de outro tenant (padrão Lignum = 404)
- Fonte manuscrita licenciável
- Precisamos de Docker Compose de Postgres neste cycle?

---

## Restrições e riscos

- Não inflar C0 com plataforma (sem repository pattern, sem event sourcing, sem BPM)
- Não reproduzir Excalidraw; só linguagem visual
- Referência Elli: `request.md` primeiro; refine gera plan/tasks/scenarios

## Referências

- `AGENTS.md`
- `cycles/README.md`
- Planejamento aprovado na conversa de 18/08/2026
- Elli: `C:\dev\orbesoft\elli\cycles`
- Harness: CascaBJJ `spec/harness.md`, Lignum `AGENTS.md`
