# request.md — Dashboard, antecedência, design system e lembrete manual (C12)

> **Ciclo:** `0819-c12-dashboard-antecedencia-e-design-system`  
> **Tipo:** Large  
> **Criado em:** 19/08/2026  
> **Path:** `cycles/Q32026/0819-c12-dashboard-antecedencia-e-design-system/`  
> **Depende de:** C10 + C11 fechados  

---

## Contexto

O quadro operacional em `/hoje` fecha o MVP (C10). O label **Hoje** no header colide com a coluna **Hoje** do quadro (não é etapa do grafo `saas_delivery`). Filtros truncam labels. Lembretes C8 só existem por política on-read — a UI é só listagem. Não há antecedência configurável para **Precisa de atenção**.

---

## Decisões propostas (confirmar no refine; locked para execute sob mandato de smoke)

| # | Tópico | Proposta |
|---|--------|----------|
| D1 | Rota | Permanecer `/hoje`; só nav + H1 viram **Dashboard** |
| D2 | Coluna Hoje | Mantém o nome |
| D3 | Antecedência | `Workspace.attentionLeadDays` (int 0–30, default **3**); PATCH no workspace da sessão |
| D4 | Quem edita | Qualquer `member`/`owner` do workspace |
| D5 | Entidades | Reminder `scheduled\|due` e Meeting `startsAt` com 1…N dias UTC até o compromisso → `needs_attention` + ícone sino |
| D6 | Duplicidade | Mesmo fato pode aparecer em seções distintas (regra C10) |
| D7 | Ícones | `lucide-react` (padrão [shadcn/ui](https://ui.shadcn.com/)) |
| D8 | Lembrete manual | `POST /api/reminders` com `draftMessage`, `dueAt`, `clientId`, `projectId` (ambos obrigatórios); `policyKey=manual`; canal `internal` |

---

## Objetivo

Dashboard no header; antecedência configurável em Precisa de atenção; shell/tokens consistentes; cadastro manual de lembrete atrelado a cliente e projeto, visível em `/lembretes`.

---

## Escopo

### Stage 1 — Shell e nomenclatura

- Nav e título principal da página operacional: **Dashboard**
- Header alinhado/centrado no eixo horizontal do conteúdo (mesmo gutter)
- Tokens de espaçamento lateral (`--page-gutter`, `--page-max`) no AppShell de rotas autenticadas

### Stage 2 — Design system e primitivos

- Ícones lucide (chevron, sino, etc.)
- Select/filtros sem truncar labels (ex. “Todos os responsáveis”)
- `/design-system` documenta tokens + primitivos + ícones (development; 404 em production)
- Aplicar primitivos/espaçamento nas telas existentes sem redesenhar fluxos

### Stage 3 — Antecedência + lembrete manual

- `attentionLeadDays` persistido no workspace; input na seção Precisa de atenção
- `GET /api/hoje` usa o valor (relógio injetável)
- `POST /api/reminders` cria lembrete manual (cliente + projeto do mesmo workspace; projeto do cliente)
- Form em `/lembretes` (e na ficha do projeto)
- Sem WhatsApp/e-mail/push; sem create BPM

---

## Fora de escopo

- Renomear a coluna **Hoje**
- Redirect `/hoje` → `/dashboard`
- Notificações externas, Google Calendar
- Config por usuário ou por item
- Motor BPM; Playwright
- Redesign pixel-perfect de cada tela em blocks shadcn

---

## Critérios de aceite

- [ ] Header e título da página operacional exibem **Dashboard**; coluna **Hoje** permanece
- [ ] Header/nav centralizados no eixo horizontal do conteúdo; gutter uniforme
- [ ] Selects não cortam “Todos os responsáveis”
- [ ] Antecedência = 3: lembrete/reunião em 3 dias UTC entra em Precisa de atenção com sino; = 0 não antecipa
- [ ] Owner/member cadastra lembrete com detalhes + cliente + projeto; aparece em `/lembretes`
- [ ] Tenant B não vê lembretes nem cards do tenant A
- [ ] `workspaceId` no body é ignorado
- [ ] `/design-system` em development; 404 em production
- [ ] Gates: lint, typecheck, test, build

---

## Stages previstas

1. Shell + nomenclatura  
2. Design system + primitivos  
3. Antecedência + lembrete manual  

---

## Pontos que o refinamento deve esclarecer

Locked para esta execução (smoke): D1–D8.

## Referências

- `spec/features/hoje/readme.md`
- `spec/features/reminders/readme.md`
- `spec/features/meetings/readme.md`
- `spec/frontend.md`
- `spec/database.md`
- Escopo aprovado na conversa de 19/08/2026
- https://ui.shadcn.com/
