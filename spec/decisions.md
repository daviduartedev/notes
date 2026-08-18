# spec/decisions.md — Architecture Decision Log

> Append-only. Each entry is immutable. To reverse a decision, add a new
> entry that supersedes the old one; never delete history.

---

## ADR-0001 — Pasta do repositório (D1)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
O produto precisava de um path estável neste cycle.

### Decisão
Manter o repo em `internal/notes`.

### Alternativas consideradas
- Renomear a pasta neste cycle — churn sem ganho.

### Consequências
C1+ assumem este path.

---

## ADR-0002 — Nome de produto na UI (D2)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
Nome comercial ainda pode mudar.

### Decisão
Nome interno **Notes**; copy “quadro operacional”.

### Alternativas consideradas
- Nome comercial definitivo agora — prematuro.

### Consequências
UI e docs usam Notes até decisão comercial futura.

---

## ADR-0003 — Persistência PostgreSQL + Prisma (D3)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
Greenfield precisava de banco relacional multi-tenant.

### Decisão
PostgreSQL 16 + Prisma 6 + Docker Compose. Sem SQLite de produção.

### Alternativas consideradas
- SQLite — insuficiente para o produto.
- Prisma 7 — quebra `url` no schema; adiado.

### Consequências
Migrations em `apps/api/prisma/migrations`. Localmente Compose publica **5433** se 5432 estiver ocupada.

---

## ADR-0004 — Auth.js credentials (D4)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
Precisávamos de sessão com cookie compartilhado entre web :3015 e API :3014.

### Decisão
Auth.js v5 (`@auth/core/jwt`) credentials na API. Login JSON `POST /api/auth/login`. Sem OAuth, 2FA ou convite.

### Alternativas consideradas
- NextAuth só no Next.js — conflita com ORCH-004 (duas portas reais).
- Callback CSRF padrão Auth.js — frágil em CORS cross-origin.

### Consequências
Cookie `authjs.session-token` HttpOnly, SameSite=Lax, host `localhost`.

---

## ADR-0005 — RBAC owner | member (D5)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
C0 precisa de papéis mínimos no Member.

### Decisão
Enum `owner` | `member`.

### Alternativas consideradas
- Mais papéis agora — fora de escopo.

### Consequências
Seed cria um `owner`. Convite fica para cycle futuro.

---

## ADR-0006 — Idioma (D6)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
Casa Orbe mistura domínio em inglês e produto em português.

### Decisão
Enums/código de domínio em inglês; UI, docs e commits em português.

### Alternativas consideradas
- Tudo EN ou tudo PT — foge do padrão da casa.

### Consequências
Specs e Gherkin em pt-BR.

---

## ADR-0007 — Tipografia Caveat + IBM Plex Sans (D10)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
O request pedia fonte manuscrita licenciável; Excalidraw/Virgil não deve ser embutido.

### Decisão
**Caveat** (SIL OFL, Google Fonts) em títulos/labels; **IBM Plex Sans** no restante (ORCH-007).

### Alternativas consideradas
- Virgil/Excalifont — risco de licença/embutir fonte do Excalidraw.

### Consequências
`next/font/google` no `apps/web`.

---

## ADR-0008 — Split web + API (ORCH-004)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c0-foundation/
- **Status:** Accepted

### Contexto
ORCH-003 exige portas 3015 e 3014 de verdade.

### Decisão
`apps/web` Next.js App Router :3015; `apps/api` Hono + Prisma + Auth.js :3014.

### Alternativas consideradas
- Next.js único fingindo duas portas — rejeitado.

### Consequências
CORS credentials obrigatório. Cookie no host localhost.

---

## ADR-0009 — Status e transições de Client (C1-D1/D2)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c1-clientes-e-projetos/
- **Status:** Accepted

### Contexto
O request pedia valores exatos de status do cliente.

### Decisão
`lead | active | inactive | archived`. Transições: lead→active|archived; active→inactive|archived; inactive→active|archived; archived terminal.

### Alternativas consideradas
- Só active/inactive — perde o funil lead.

### Consequências
Máquina de estados no domínio, HTTP 409 se inválida.

---

## ADR-0010 — Envelope de Project.status e overdue (C1-D3/D4/D11)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c1-clientes-e-projetos/
- **Status:** Accepted

### Contexto
C1 entrega o envelope, não as etapas (C2).

### Decisão
`draft | active | on_hold | completed | cancelled` com transições fechadas. `visualState: overdue` quando active e prazo passado. Progresso manual 0–100. Prioridade `low|medium|high|urgent`.

### Alternativas consideradas
- Progresso derivado de checklist — C4.
- Overdue como status persistido — rejeitado; é DTO.

### Consequências
Etapas/pipeline ficam para C2/C3.

---

## ADR-0011 — ActivityEvent com actions pontuadas (C1-D9/D10)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c1-clientes-e-projetos/
- **Status:** Accepted

### Contexto
Mutações precisam de histórico consultável, não só uma frase.

### Decisão
Tabela `ActivityEvent`; actions `client.created`, `client.updated`, `project.created`, `project.updated`, `project.status_changed`. Payload JSON sem telefone/e-mail.

### Alternativas consideradas
- Event sourcing / bus — fora de escopo.

### Consequências
GET nas fichas; histórico do cliente agrega eventos dos seus projetos.

