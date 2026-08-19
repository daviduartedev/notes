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

---

## ADR-0012 — Template SaaS delivery por workspace (C2-D1/D4/D12)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c2-etapas-e-transicoes/
- **Status:** Accepted

### Contexto
C2 precisa de um pipeline concreto sem editor de workflow.

### Decisão
Um template seed `saas_delivery` por workspace (10 etapas lineares Comercial/Design/Desenvolvimento). Instâncias são deep copy. Outros tipos ficam para C11.

### Alternativas consideradas
- BPM genérico — fora de escopo.
- Vários templates na UI agora — C11.

### Consequências
Criação de projeto copia etapas em transação. Mutar o seed não reescreve instâncias.

---

## ADR-0013 — Transições de etapa sem PATCH de ponteiro (C2-D2–D8/D10–D15)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c2-etapas-e-transicoes/
- **Status:** Accepted

### Contexto
O ponteiro `currentStageId` não pode ser escrito genericamente.

### Decisão
`POST /api/projects/:id/stages/:stageId/transition` com `action` e/ou `to`. Qualquer member/owner. `blocked` não completa. Completed não reabre. Ilegal → 409. Cross-tenant → 404. PATCH `currentStageId` ignorado.

### Alternativas consideradas
- PATCH genérico do ponteiro — rejeitado.
- Só o responsável transiciona — rejeitado neste cycle.

### Consequências
UI disabled com motivo pt-BR vindo da API. Entidade Blocker permanece C7.

---

## ADR-0014 — Events de etapa no ActivityEvent (C2-D9)

- **Data:** 2026-08-18
- **Cycle:** cycles/Q32026/0818-c2-etapas-e-transicoes/
- **Status:** Accepted

### Contexto
Histórico precisa mostrar de/para.

### Decisão
Actions `stage.started`, `stage.transitioned`, `stage.completed` no `ActivityEvent` do projeto. Payload de transição com `from`/`to`. 409 não grava `stage.transitioned`.

### Alternativas consideradas
- Event sourcing — fora de escopo.

### Consequências
Histórico da ficha exibe o avanço do pipeline.

---

## ADR-0015 — Colunas do pipeline por currentStage.key (C3-D1/D2/D7)

- **Data:** 2026-08-19
- **Cycle:** cycles/Q32026/0818-c3-pipeline/
- **Status:** Accepted

### Contexto
O request C3 deixava aberto agrupar por `key` fino vs `phase`, e se haveria drag neste Medium.

### Decisão
Dez colunas = keys do template SaaS, ordem `order`. Sempre presentes, mesmo vazias. Click-only para `/projetos/:id`. Sem `@dnd-kit`.

### Alternativas consideradas
- Colunas por `phase` (3) — pouco operacional.
- Drag neste Medium — classificado Large; adiado.

### Consequências
O board não transiciona etapa. Transição continua na ficha (C2).

---

## ADR-0016 — GET /api/pipeline scoped com filtros (C3-D3–D15)

- **Data:** 2026-08-19
- **Cycle:** cycles/Q32026/0818-c3-pipeline/
- **Status:** Accepted

### Contexto
Precisávamos de um endpoint de quadro sem N+1 e sem vazar tenant.

### Decisão
`GET /api/pipeline` devolve `{ columns }`. Envelopes `draft|active|on_hold`. Omitir sem etapa. Filtros `ownerUserId`, `clientId`, `priority`. Collection de outro workspace: colunas vazias. Prisma `include` client/currentStage/owner.

### Alternativas consideradas
- Reusar `GET /api/projects` e agrupar no client — N+1 de stages.
- 404 na collection cross-tenant — inadequado para listagem.

### Consequências
C10 pode reutilizar o DTO de card. Playwright continua fora.

---

## ADR-0017 — Template de checklist ≠ instância (C4-D1–D6/D11/D17)

- **Data:** 2026-08-19
- **Cycle:** cycles/Q32026/0818-c4-checklists/
- **Status:** Accepted

### Contexto
Checklist é trabalho previsto. Mutar o molde não pode corromper o que já foi aplicado.

### Decisão
Apply faz deep copy para `ProjectChecklist` + `ChecklistItem`. Seed `Deploy Staging SaaS` (`deploy_staging_saas`) por workspace. Sem CRUD UI neste cycle. Só `owner` edita o molde via API; `member` aplica e marca itens. `validationId` sempre null.

### Alternativas consideradas
- Sync molde → instâncias — rejeitado.
- CRUD UI de templates neste Medium — adiado.

### Consequências
C5 pode preencher `validationId` sem mudar o apply.

---

## ADR-0019 — Máquina de Validation.status (C5-D1–D10/D16)

- **Data:** 2026-08-19
- **Cycle:** cycles/Q32026/0818-c5-validacoes/
- **Status:** Accepted

### Contexto
Validação precisa de estados explícitos sem PATCH direto de status e sem virar Approval.

### Decisão
Máquina `draft→requested|cancelled`; `requested→in_review|cancelled`; `in_review→changes_requested|approved|rejected`; `changes_requested→in_review|cancelled`. Só `POST /api/validations/:id/transition`. Events `validation.requested|in_review|changes_requested|approved|rejected`. Overdue no DTO se prazo vencido e status não terminal. Tipos `prototype|staging|production|feature|delivery`. UI StatusPill roxo.

### Alternativas consideradas
- PATCH de status — rejeitado (igual C2).
- Recuar etapa em `changes_requested` — rejeitado.

### Consequências
C6 não pode tratar `approved` de validação como Approval. Playwright continua fora.

---

## ADR-0020 — Validação ≠ Approval; checklist opcional (C5-D11–D20)

- **Data:** 2026-08-19
- **Cycle:** cycles/Q32026/0818-c5-validacoes/
- **Status:** Accepted

### Contexto
C4 deixou `validationId` null. C5 precisa ligar checklist sem criar Approval.

### Decisão
`checklistId` opcional na Validation; preenche `ProjectChecklist.validationId`. Isolamento: GET por id → 404; collection → `[]`. Sem modelo/rota Approval. Qualquer member/owner transiciona.

### Alternativas consideradas
- Checklist obrigatório — rejeitado.
- Entidade Approval neste Medium — C6.

### Consequências
C6 cria Approval do zero. Playwright continua fora.

---

## ADR-0018 — Completar item não muda Stage.status (C4-D7–D16)

- **Data:** 2026-08-19
- **Cycle:** cycles/Q32026/0818-c4-checklists/
- **Status:** Accepted

### Contexto
Checklist não é etapa nem pendência.

### Decisão
`PATCH /api/checklist-items/:id` grava `completedByUserId` da sessão, `completedAt` e `note`. Não altera `Stage.status`. Events `checklist.applied` e `checklist.item_completed`. IDOR → 404. Collection de outro tenant → lista vazia.

### Alternativas consideradas
- Completar checklist avança a etapa — rejeitado.
- Playwright E2E — ORCH-008.

### Consequências
Transição de etapa continua só no contrato C2. Playwright continua fora.

