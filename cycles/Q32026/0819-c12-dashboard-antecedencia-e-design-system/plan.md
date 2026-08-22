# plan.md — C12 Dashboard, antecedência, design system e lembrete manual

Delta sobre specs C10/C8/C9/frontend. Decisões D1–D8 locked no `request.md`.

## Estado atual

- Nav e H1 da rota `/hoje` dizem **Hoje**; a coluna do quadro também.
- AppShell: `max-w-5xl px-6`, header `justify-between`, nav à esquerda.
- Select nativo `w-full` em grid apertado trunca “Todos os responsáveis”.
- `/design-system` lista primitivos C0 sem tokens de gutter nem ícones.
- `GET /api/hoje`: reminders/meetings só na coluna **Hoje** no dia UTC; sem antecedência.
- Sem `POST /api/reminders`; create só via política `proposalWaitingClientFollowUp`.

## Estado-alvo

- Copy **Dashboard** (nav + título); rota `/hoje` estável; coluna **Hoje** intacta.
- Tokens `--page-gutter` / `--page-max`; header com nav centrada.
- lucide-react; FilterBar/Select com min-width; galeria `/design-system`.
- `Workspace.attentionLeadDays` (0–30, default 3) no GET workspace e PATCH `/api/workspace`.
- Read model: compromisso em 1…N dias UTC → `needs_attention` + `alert`.
- `POST /api/reminders` manual (`policyKey=manual`, cliente+projeto).

## Decisões

| ID | Decisão |
|----|---------|
| D1 | Rota `/hoje` |
| D2 | Coluna Hoje permanece |
| D3–D4 | Setting no workspace; member/owner PATCH |
| D5–D6 | Reminder ativo + Meeting; duplicidade C10 ok |
| D7 | lucide-react, sem migrar todos os primitivos para CLI shadcn |
| D8 | POST create; `workspaceId` ignorado; projeto deve ser do cliente |

## Arquivos prováveis

- `apps/api/prisma/schema.prisma` + migration `attention_lead_days`
- `apps/api/src/deps.ts`, `prisma-auth.ts`, `workspace/routes.ts`
- `apps/api/src/domain/hoje-dashboard.ts`, `reminders/schema.ts`, `reminders/routes.ts`
- `apps/web/src/components/app-shell.tsx`, `ui/select.tsx`, `hoje-board.tsx`
- `apps/web/src/app/hoje/page.tsx`, `lembretes/page.tsx`, `design-system/page.tsx`
- `apps/web/src/app/globals.css`

## Riscos

- GET `/api/workspace` deixa de ser `{id,name}` exato — atualizar testes `toEqual`.
- Antecedência + coluna Hoje pode duplicar no dia D (aceitável).
- Superfície de layout em todas as páginas via AppShell apenas.

## Testes

- Domínio: lead 3 inclui D+3; lead 0 não; due today continua em `today`.
- HTTP: POST reminder 201; projeto de outro cliente 400; tenant B 404; PATCH lead days; GET hoje com sino/alert.
- Web copy: Dashboard no nav/título; design-system 404 em production.
